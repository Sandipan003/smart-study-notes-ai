import os
import json
import re
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Enable CORS for all routes to communicate with Vite React frontend
CORS(app, origins=["*"])

# Hardcoded Gemini API Key fallback (used when env var is not set)
HARDCODED_GEMINI_KEY = "AIzaSyAQ.Ab8RN6L6pHPJ3jxVrqV84_Go-v3_WkbC6c-7EPl1wbDWvPNSVg"

# Default Mock Data to serve if API keys are missing or calls fail
DEFAULT_MOCK_DATA = {
    "summary": """# Photosynthesis & Cellular Respiration Overview

## 1. Photosynthesis
Photosynthesis is the process used by plants, algae, and certain bacteria to harness energy from sunlight and turn it into chemical energy.

### Key Equations
The overall chemical equation for photosynthesis is:
$$6CO_2 + 6H_2O + \\text{light energy} \\rightarrow C_6H_{12}O_6 + 6O_2$$

### The Two Main Stages:
*   **Light-dependent Reactions**: Occur in the thylakoid membranes. Solar energy is captured by chlorophyll and converted into ATP and NADPH, releasing oxygen ($O_2$) as a byproduct.
*   **The Calvin Cycle (Light-independent)**: Occurs in the stroma. Carbon dioxide ($CO_2$) is fixed into organic compounds like glucose using the ATP and NADPH generated in the light reactions.

---

## 2. Cellular Respiration
Cellular respiration is the set of metabolic reactions and processes that take place in the cells of organisms to convert biochemical energy from nutrients into ATP, and then release waste products.

### Key Equation
$$C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + 36-38 \\text{ ATP}$$

### Three Main Stages:
1.  **Glycolysis**: Happens in the cytoplasm. Breaks glucose down into pyruvate, producing a net of 2 ATP.
2.  **The Krebs Cycle (Citric Acid Cycle)**: Happens in the mitochondrial matrix. Generates electron carriers (NADH, $FADH_2$) and releases $CO_2$.
3.  **The Electron Transport Chain (ETC)**: Occurs in the inner mitochondrial membrane. Utilizes electrons from carriers to produce the bulk of ATP (~32-34 molecules) via oxidative phosphorylation.""",
    "flashcards": [
        {"front": "Chlorophyll", "back": "The primary green pigment in plants that absorbs light energy (primarily blue and red wavelengths) to drive the light-dependent reactions of photosynthesis."},
        {"front": "Thylakoid Membrane", "back": "The internal membrane structure of chloroplasts where the light-dependent reactions of photosynthesis occur, containing photosystems and electron transport chains."},
        {"front": "Stroma", "back": "The fluid-filled space surrounding the thylakoids inside the chloroplast, where the Calvin Cycle (light-independent reactions) takes place."},
        {"front": "Calvin Cycle", "back": "The dark (light-independent) reactions of photosynthesis that use ATP and NADPH to convert carbon dioxide (CO2) into glucose (C6H12O6)."},
        {"front": "Glycolysis", "back": "The anaerobic process occurring in the cell's cytoplasm that breaks down one molecule of glucose into two molecules of pyruvate, generating a net gain of 2 ATP and 2 NADH."},
        {"front": "Krebs Cycle", "back": "Also known as the Citric Acid Cycle, it takes place in the mitochondrial matrix and processes acetyl-CoA to yield CO2, ATP, NADH, and FADH2."},
        {"front": "ATP Synthase", "back": "A massive enzyme complex in the inner mitochondrial membrane (and thylakoid membrane) that uses a proton gradient to synthesize ATP from ADP and inorganic phosphate."},
        {"front": "Aerobic Respiration", "back": "The metabolic process of producing cellular energy in the presence of oxygen, resulting in about 36-38 ATP per glucose molecule compared to only 2 ATP in anaerobic glycolysis."}
    ],
    "quiz": [
        {
            "question": "Which of the following is the correct site for the light-dependent reactions of photosynthesis?",
            "options": ["Stroma", "Thylakoid Membrane", "Mitochondrial Matrix", "Cytoplasm"],
            "answer": "Thylakoid Membrane",
            "explanation": "The light-dependent reactions of photosynthesis take place in the thylakoid membranes because that is where chlorophyll and the photosystems are structurally housed."
        },
        {
            "question": "What is the net yield of ATP molecules produced directly during Glycolysis per molecule of glucose?",
            "options": ["2 ATP", "4 ATP", "32 ATP", "36 ATP"],
            "answer": "2 ATP",
            "explanation": "Although glycolysis generates 4 ATP in total, it requires an initial investment of 2 ATP, resulting in a net yield of 2 ATP molecules."
        },
        {
            "question": "Which molecule acts as the final electron acceptor in the electron transport chain of aerobic cellular respiration?",
            "options": ["Carbon Dioxide (CO2)", "Water (H2O)", "Oxygen (O2)", "Glucose (C6H12O6)"],
            "answer": "Oxygen (O2)",
            "explanation": "Oxygen (O2) acts as the final electron acceptor at the end of the electron transport chain, combining with hydrogen protons to form water (H2O)."
        },
        {
            "question": "What compound is primary fixed during the Calvin Cycle to produce sugars?",
            "options": ["Oxygen (O2)", "Carbon Dioxide (CO2)", "ATP", "Pyruvate"],
            "answer": "Carbon Dioxide (CO2)",
            "explanation": "The Calvin Cycle is responsible for carbon fixation, where inorganic carbon dioxide (CO2) from the air is incorporated into organic sugar molecules."
        },
        {
            "question": "In cellular respiration, where does the Citric Acid (Krebs) Cycle take place?",
            "options": ["Inner mitochondrial membrane", "Mitochondrial matrix", "Cytoplasm", "Chloroplast stroma"],
            "answer": "Mitochondrial matrix",
            "explanation": "The Krebs Cycle occurs within the mitochondrial matrix, which contains the necessary enzymes to oxidize acetyl-CoA and generate electron carriers."
        }
    ]
}

def clean_json_string(response_text):
    """
    Cleans model response string to extract pure JSON.
    Removes markdown code blocks (e.g., ```json ... ```) if present.
    """
    text = response_text.strip()
    
    # Try searching for JSON block
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1)
        
    # If no markdown blocks, find first '{' and last '}'
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1:
        return text[start:end+1]
        
    return text

def resolve_api_key(api_key, env_var="GEMINI_API_KEY"):
    """
    If the API key is empty, or is a visual bullet-masked placeholder sent
    by the frontend (e.g. '••••'), retrieves the real key from the server environment.
    Falls back to hardcoded key for Vercel deployment.
    """
    if not api_key or "•" in api_key or "gsk_test_api_key" in api_key:
        env_key = os.environ.get(env_var)
        return env_key if env_key else HARDCODED_GEMINI_KEY
    return api_key

def generate_study_material(text_content, engine="gemini", api_key=None, model=None):
    """
    Sends the extracted text content to Gemini or Ollama to generate
    structured summary, flashcards, and quiz items.
    """
    if not text_content or len(text_content.strip()) < 10:
        raise ValueError("Insufficient text content provided to generate study guide.")

    # Trim content to avoid token overflow
    trimmed_content = text_content[:18000]

    system_prompt = """You are an elite academic tutor. Your task is to analyze the provided study notes/text and generate a structured JSON object containing a comprehensive summary, flashcards, and a multiple-choice quiz.

You MUST respond with a single, valid JSON object containing exactly these keys:
1. "summary": A detailed markdown formatted text summarizing the key concepts, main points, equations, and structures found in the text. Use clear subheadings, bullet points, and clean spacing.
2. "flashcards": An array of objects. Each object must have:
    - "front": A key term, question, or formula.
    - "back": A clear, concise explanation, definition, or answer.
    Provide between 5 to 10 high-quality flashcards.
3. "quiz": An array of objects. Each object must have:
    - "question": A clear multiple-choice question testing understanding.
    - "options": An array of exactly 4 plausible choices.
    - "answer": The correct answer (must match one of the items in "options" exactly).
    - "explanation": An insightful explanation of why that answer is correct and why other choices are incorrect.
    Provide between 5 to 8 questions.

Response constraints:
- Do NOT output any conversational text or formatting outside the JSON object.
- Do NOT wrap the response in markdown code blocks unless forced to, but if you do, output ONLY valid JSON.
- Ensure the JSON is properly formatted with escaped quotes where necessary.
- Return ONLY the raw JSON object.
"""

    user_prompt = f"Here is the study material text to process:\n\n{trimmed_content}"

    # Determine which engine to use
    if engine == "gemini":
        # Resolve Gemini Key
        gemini_api_key = resolve_api_key(api_key, "GEMINI_API_KEY")
        if not gemini_api_key:
            raise ValueError("Gemini API Key is missing. Please provide it in settings or set it on the backend.")
            
        gemini_model = model or "gemini-2.0-flash"
        
        # Combine instructions and user prompt for Gemini
        gemini_prompt = f"{system_prompt}\n\nHere is the study material text to process:\n\n{trimmed_content}"
        
        url = f"https://generativelanguage.googleapis.com/v1/models/{gemini_model}:generateContent?key={gemini_api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{
                "parts": [{"text": gemini_prompt}]
            }]
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=45)
        if response.status_code != 200:
            raise Exception(f"Gemini API Error ({response.status_code}): {response.text}")
            
        result_json = response.json()
        try:
            raw_content = result_json["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError) as parse_err:
            print(f"Gemini parsing failure. Raw payload: {result_json}")
            raise Exception("Failed to retrieve text content from Gemini response candidates.")

    elif engine == "ollama":
        # Default local URL and model
        ollama_url = "http://localhost:11434/api/chat"
        ollama_model = model or "llama3"
        
        payload = {
            "model": ollama_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "format": "json",
            "stream": False,
            "options": {
                "temperature": 0.3
            }
        }
        
        response = requests.post(
            ollama_url,
            json=payload,
            timeout=60
        )
        
        if response.status_code != 200:
            raise Exception(f"Ollama API Error ({response.status_code}): {response.text}")
            
        result_json = response.json()
        raw_content = result_json["message"]["content"]
        
    else:
        raise ValueError(f"Unsupported GenAI engine: {engine}")

    # Parse and clean output
    cleaned_content = clean_json_string(raw_content)
    try:
        parsed_data = json.loads(cleaned_content)
        # Validate keys
        required_keys = ["summary", "flashcards", "quiz"]
        for key in required_keys:
            if key not in parsed_data:
                raise KeyError(f"Missing required key '{key}' in LLM JSON response.")
        return parsed_data
    except Exception as e:
        print(f"Error parsing LLM response as JSON: {e}")
        print("Raw Content was:")
        print(raw_content)
        raise Exception(f"Failed to generate structured study notes. The model output was not valid JSON: {str(e)}")

def save_key_to_env(env_var_name, api_key):
    """
    Saves the provided API key (GROQ_API_KEY or GEMINI_API_KEY) to the backend .env file.
    """
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    
    # Read existing lines if file exists
    lines = []
    if os.path.exists(env_path):
        try:
            with open(env_path, 'r') as f:
                lines = f.readlines()
        except Exception as e:
            print(f"Error reading existing .env file: {e}")
            
    # Check if key exists
    key_found = False
    new_lines = []
    prefix = f"{env_var_name}="
    for line in lines:
        if line.strip().startswith(prefix):
            new_lines.append(f"{prefix}{api_key}\n")
            key_found = True
        else:
            new_lines.append(line)
            
    if not key_found:
        new_lines.append(f"{prefix}{api_key}\n")
        
    try:
        with open(env_path, 'w') as f:
            f.writelines(new_lines)
        print(f"✔ {env_var_name} written to backend .env file.")
    except Exception as e:
        raise Exception(f"Failed to write API key to server configuration: {str(e)}")
        
    # Reload environment variables
    load_dotenv(env_path, override=True)

def extract_text_via_gemini_vision(file_bytes, api_key=None):
    """
    Renders PDF pages to images using PyMuPDF and utilizes Gemini 2.5 Flash
    multimodal API to perform OCR on the pages.
    """
    import fitz
    import base64
    
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    ocr_text = ""
    
    # Process up to 5 pages
    pages_to_process = min(len(doc), 5)
    print(f"Scanned PDF detected. Running Gemini 1.5 Flash Vision OCR fallback on {pages_to_process} pages...")
    
    gemini_key = resolve_api_key(api_key, "GEMINI_API_KEY")
    if not gemini_key:
        raise ValueError("Gemini API key required to perform Gemini Vision OCR.")
        
    for i in range(pages_to_process):
        try:
            page = doc[i]
            pix = page.get_pixmap(dpi=150)
            img_bytes = pix.tobytes("png")
            base64_img = base64.b64encode(img_bytes).decode('utf-8')
            
            url = f"https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key={gemini_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [{
                    "parts": [
                        {"text": "Extract all readable text, mathematical formulas, notes, and labels from this page of study material. Return only the transcript of the text content. Do not summarize, explain, or add any introductory comments. Start directly with the text content."},
                        {
                            "inlineData": {
                                "mimeType": "image/png",
                                "data": base64_img
                            }
                        }
                    ]
                }]
            }
            
            response = requests.post(url, headers=headers, json=payload, timeout=35)
            if response.status_code == 200:
                page_text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
                ocr_text += f"\n--- Page {i+1} OCR ---\n" + page_text
                print(f"✔ Page {i+1} successfully OCR'd via Gemini Vision.")
            else:
                print(f"✘ Gemini Vision OCR failed for page {i+1}: {response.text}")
        except Exception as e:
            print(f"Error executing Gemini Vision OCR for page {i+1}: {e}")
            
    return ocr_text

def extract_text_via_vision(file_bytes, engine="gemini", api_key=None):
    """
    Renders PDF pages to images using PyMuPDF and utilizes Gemini Vision OCR
    or Ollama Vision (llava) fallback to extract text content.
    """
    if engine == "gemini":
        return extract_text_via_gemini_vision(file_bytes, api_key)
        
    import fitz
    import base64
    
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    ocr_text = ""
    
    # Process up to 5 pages
    pages_to_process = min(len(doc), 5)
    print(f"No extractable text found. Initiating local Ollama Vision OCR fallback on {pages_to_process} pages...")
    
    for i in range(pages_to_process):
        try:
            page = doc[i]
            pix = page.get_pixmap(dpi=150)
            img_bytes = pix.tobytes("png")
            base64_img = base64.b64encode(img_bytes).decode('utf-8')
            
            ollama_url = "http://localhost:11434/api/chat"
            payload = {
                "model": "llava",
                "messages": [
                    {
                        "role": "user",
                        "content": "Extract all text from this page. Do not summarize.",
                        "images": [base64_img]
                    }
                ],
                "stream": False
            }
            response = requests.post(ollama_url, json=payload, timeout=45)
            if response.status_code == 200:
                page_text = response.json()["message"]["content"]
                ocr_text += f"\n--- Page {i+1} OCR ---\n" + page_text
                print(f"✔ Page {i+1} successfully transcribed via Ollama Vision.")
            else:
                print(f"✘ Ollama Vision OCR failed for page {i+1}: {response.text}")
                    
        except Exception as page_err:
            print(f"Error executing local Ollama Vision OCR for page {i+1}: {page_err}")
            
    return ocr_text

@app.route('/api/health', methods=['GET'])
def health():
    # Force dotenv reload to pick up saved keys
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    load_dotenv(env_path, override=True)
    sb_url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    sb_key = os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    return jsonify({
        "status": "healthy", 
        "engine_env_configured": bool(os.environ.get("GEMINI_API_KEY")),
        "supabase_configured": bool(sb_url) and bool(sb_key)
    })

@app.route('/api/save-key', methods=['POST'])
def save_key():
    """
    Saves Gemini API key and Supabase credentials to server-side .env file.
    """
    try:
        data = request.json or {}
        gemini_key = data.get("apiKey", "").strip()
        supabase_url = data.get("supabaseUrl", "").strip()
        supabase_key = data.get("supabaseKey", "").strip()
        
        # Save Gemini API Key if provided
        if gemini_key:
            save_key_to_env("GEMINI_API_KEY", gemini_key)
            
        # Save Supabase configurations if provided
        if supabase_url:
            save_key_to_env("SUPABASE_URL", supabase_url)
        if supabase_key:
            save_key_to_env("SUPABASE_KEY", supabase_key)
            
        return jsonify({"success": True, "message": "Keys and connection details successfully saved and locked on the backend server."})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate', methods=['POST'])
def generate_from_pdf():
    """
    Accepts PDF upload, extracts text (PyMuPDF -> pypdf -> Vision OCR), and sends it to LLM.
    """
    try:
        # Check if file is uploaded
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded. Please upload a PDF file."}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected."}), 400
            
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({"error": "Invalid file type. Please upload a PDF."}), 400

        # Read config options from request form
        engine = request.form.get("engine", "groq")
        api_key = request.form.get("apiKey", "").strip()
        model = request.form.get("model", "").strip()
        use_fallback = request.form.get("useFallback", "false").lower() == "true"

        if use_fallback:
            return jsonify(DEFAULT_MOCK_DATA)

        # Read file bytes in memory (to allow multiple extraction passes)
        file_bytes = file.read()
        if not file_bytes:
            return jsonify({"error": "Uploaded file is empty."}), 400

        extracted_text = ""
        is_pdf = file_bytes.startswith(b'%PDF-')

        if not is_pdf:
            # Failsafe: check if this is plain text/markdown uploaded with a PDF extension
            try:
                extracted_text = file_bytes.decode('utf-8', errors='ignore')
                print(f"Uploaded file does not have standard PDF header, parsed as plain text: {len(extracted_text.strip())} chars.")
            except Exception as txt_err:
                print(f"Failed to decode uploaded non-PDF bytes as text: {txt_err}")
                return jsonify({"error": "Invalid file format. Please upload a valid PDF document or copy-paste text notes."}), 400
        else:
            # 1. Primary Extraction: PyMuPDF (fitz)
            try:
                import fitz
                doc = fitz.open(stream=file_bytes, filetype="pdf")
                for page in doc:
                    text = page.get_text()
                    if text:
                        extracted_text += text + "\n"
                print(f"PyMuPDF Extraction completed. Extracted {len(extracted_text.strip())} chars.")
            except Exception as fitz_err:
                print(f"PyMuPDF extraction failed: {fitz_err}")

            # 2. Secondary Extraction: pypdf (if PyMuPDF extracted nothing or failed)
            if len(extracted_text.strip()) < 15:
                try:
                    import io
                    from pypdf import PdfReader
                    reader = PdfReader(io.BytesIO(file_bytes))
                    extracted_text = ""
                    for page in reader.pages:
                        text = page.extract_text()
                        if text:
                            extracted_text += text + "\n"
                    print(f"pypdf Fallback Extraction completed. Extracted {len(extracted_text.strip())} chars.")
                except Exception as pdf_err:
                    print(f"pypdf extraction failed: {pdf_err}")

        # 3. Vision OCR Fallback: If text is still empty (e.g. Scanned images in PDF)
        if len(extracted_text.strip()) < 15:
            try:
                extracted_text = extract_text_via_vision(
                    file_bytes=file_bytes,
                    engine=engine,
                    api_key=api_key
                )
            except Exception as vision_err:
                print(f"Vision OCR failed: {vision_err}")
                return jsonify({"error": f"Scanned PDF detected, but Vision OCR processing failed: {str(vision_err)}"}), 400

        if not extracted_text.strip():
            return jsonify({"error": "The PDF file seems to be empty or contains scanned images only, and no extractable text could be retrieved. Please try pasting raw notes or using a text-based PDF."}), 400

        # Send to LLM
        result = generate_study_material(
            text_content=extracted_text,
            engine=engine,
            api_key=api_key if api_key else None,
            model=model if model else None
        )
        
        return jsonify(result)

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/text-generate', methods=['POST'])
def generate_from_text():
    """
    Accepts raw text and sends to LLM.
    """
    try:
        data = request.json or {}
        text_content = data.get("text", "")
        engine = data.get("engine", "groq")
        api_key = data.get("apiKey", "").strip()
        model = data.get("model", "").strip()
        use_fallback = data.get("useFallback", False)

        if use_fallback:
            return jsonify(DEFAULT_MOCK_DATA)

        if not text_content.strip():
            return jsonify({"error": "Please enter or paste your study notes."}), 400

        result = generate_study_material(
            text_content=text_content,
            engine=engine,
            api_key=api_key if api_key else None,
            model=model if model else None
        )
        
        return jsonify(result)

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

def query_supabase(method, table, data=None, params=None):
    """
    Executes REST request to Supabase API.
    """
    sb_url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    sb_key = os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    if not sb_url or not sb_key:
        return None
        
    sb_url = sb_url.strip().rstrip('/')
    url = f"{sb_url}/rest/v1/{table}"
        
    headers = {
        "apikey": sb_key,
        "Authorization": f"Bearer {sb_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    try:
        if method == "POST":
            r = requests.post(url, headers=headers, json=data, params=params, timeout=15)
        elif method == "GET":
            r = requests.get(url, headers=headers, params=params, timeout=15)
        elif method == "DELETE":
            r = requests.delete(url, headers=headers, params=params, timeout=15)
        else:
            return None
            
        if r.status_code in [200, 201, 204]:
            return r.json() if r.text else True
        else:
            print(f"Supabase REST Error ({r.status_code}): {r.text}")
            return None
    except Exception as e:
        print(f"Supabase Request failed: {e}")
        return None

@app.route('/api/save-guide', methods=['POST'])
def save_guide():
    try:
        data = request.json or {}
        payload = {
            "title": data.get("title", "Untitled Guide"),
            "summary": data.get("summary", ""),
            "flashcards": data.get("flashcards", []),
            "quiz": data.get("quiz", [])
        }
        res = query_supabase("POST", "study_guides", data=payload)
        if not res:
            return jsonify({"error": "Failed to save guide to Supabase. Check database logs."}), 500
        return jsonify(res[0] if isinstance(res, list) else res)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/list-guides', methods=['GET'])
def list_guides():
    try:
        res = query_supabase("GET", "study_guides", params={"select": "id,title,created_at", "order": "created_at.desc"})
        if res is None:
            return jsonify([])
        return jsonify(res)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/get-guide/<guide_id>', methods=['GET'])
def get_guide(guide_id):
    try:
        res = query_supabase("GET", "study_guides", params={"id": f"eq.{guide_id}", "select": "*"})
        if not res:
            return jsonify({"error": "Guide not found."}), 404
        return jsonify(res[0] if isinstance(res, list) else res)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat/save', methods=['POST'])
def save_chat_msg():
    try:
        data = request.json or {}
        payload = {
            "guide_id": data.get("guide_id"),
            "role": data.get("role"),
            "content": data.get("content")
        }
        res = query_supabase("POST", "chat_history", data=payload)
        if not res:
            return jsonify({"error": "Failed to save chat log."}), 500
        return jsonify(res[0] if isinstance(res, list) else res)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat/history/<guide_id>', methods=['GET'])
def get_chat_history(guide_id):
    try:
        res = query_supabase("GET", "chat_history", params={"guide_id": f"eq.{guide_id}", "select": "*", "order": "created_at.asc"})
        if res is None:
            return jsonify([])
        return jsonify(res)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat/ask', methods=['POST'])
def chat_ask():
    try:
        data = request.json or {}
        message = data.get("message", "")
        history = data.get("history", [])
        summary_context = data.get("summary", "")
        engine = data.get("engine", "gemini")
        api_key = data.get("apiKey", "").strip()
        model = data.get("model", "").strip()
        use_fallback = data.get("useFallback", False)

        if use_fallback:
            return jsonify({
                "response": "This is a tutoring mock response in Demo Mode. Connect your Gemini API Key to chat with a live AI Tutor!"
            })

        if not message.strip():
            return jsonify({"error": "Message is empty."}), 400

        # Construct system instructions with summary context
        system_prompt = f"""You are a supportive, knowledgeable AI Study Tutor helper. 
Your goal is to explain concepts, answer questions, and tutor the student based on their uploaded study materials.
Always refer to the study material summary below as your primary context when possible. Keep answers clear, engaging, and friendly.

Here is the study material summary context:
{summary_context}"""

        # Choose AI Engine
        if engine == "gemini":
            gemini_api_key = resolve_api_key(api_key, "GEMINI_API_KEY")
            if not gemini_api_key:
                raise ValueError("Gemini API Key is missing. Check your settings panel.")
                
            gemini_model = model or "gemini-2.0-flash"
            
            # Format chat payload for Gemini API
            contents = []
            
            # Add past history messages
            for msg in history:
                role_val = "user" if msg["role"] == "user" else "model"
                contents.append({
                    "role": role_val,
                    "parts": [{"text": msg["content"]}]
                })
                
            # Add user message
            contents.append({
                "role": "user",
                "parts": [{"text": f"[CONTEXT: Refer to system instructions and summary material]\nUser Message: {message}"}]
            })
            
            url = f"https://generativelanguage.googleapis.com/v1/models/{gemini_model}:generateContent?key={gemini_api_key}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": contents,
                "systemInstruction": {
                    "parts": [{"text": system_prompt}]
                }
            }
            
            response = requests.post(url, headers=headers, json=payload, timeout=25)
            if response.status_code != 200:
                raise Exception(f"Gemini API Error: {response.text}")
                
            result_json = response.json()
            reply = result_json["candidates"][0]["content"]["parts"][0]["text"]
            return jsonify({"response": reply})

        elif engine == "ollama":
            ollama_url = "http://localhost:11434/api/chat"
            ollama_model = model or "llama3"
            
            messages = [{"role": "system", "content": system_prompt}]
            for msg in history:
                messages.append({"role": msg["role"], "content": msg["content"]})
            messages.append({"role": "user", "content": message})
            
            payload = {
                "model": ollama_model,
                "messages": messages,
                "stream": False
            }
            response = requests.post(ollama_url, json=payload, timeout=25)
            if response.status_code != 200:
                raise Exception(f"Ollama local error: {response.text}")
            reply = response.json()["message"]["content"]
            return jsonify({"response": reply})

        else:
            return jsonify({"error": "Unsupported engine."}), 400

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Use port 5001 to avoid default conflicts on macOS (AirPlay uses 5000)
    app.run(host='0.0.0.0', port=5001, debug=True)
