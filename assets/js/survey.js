/**
 * Survey.js - Multi-page Survey System for Jekyll
 * Handles survey navigation, state management, and Cloud Run API submission
 */

// CRITICAL: Replace with your actual Cloud Run API endpoint URL
const CLOUD_RUN_ENDPOINT = "https://survey-api-365853907280.us-central1.run.app/submit-survey";

// API Validation Constants (from OpenAPI spec)
const API_CONSTRAINTS = {
  SURVEY_CODE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
    ERROR_MSG: 'Survey code must be 3-50 characters and contain only letters, numbers, dashes, and underscores'
  },
  QUESTION: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 1000,
    ERROR_MSG: 'Question text must be 1-1000 characters'
  },
  ANSWER: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 5000,
    ERROR_MSG: 'Answer must be 1-5000 characters'
  },
  QUESTIONS_ARRAY: {
    MIN_ITEMS: 1,
    MAX_ITEMS: 50,
    ERROR_MSG: 'Survey must have 1-50 questions'
  }
};

// Markdown Parser for rendering intro.md and appendix.md
class MarkdownParser {
  static parse(markdown) {
    let html = markdown;

    // Headers (must be done in order from most specific to least)
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Links — validate protocol to prevent javascript: and data: XSS
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, function(match, text, url) {
      var normalizedUrl = url.trim().toLowerCase();
      if (normalizedUrl.startsWith('http://') || normalizedUrl.startsWith('https://') || normalizedUrl.startsWith('mailto:')) {
        return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + text + '</a>';
      }
      return text; // Strip dangerous links, keep the text
    });

    // Unordered lists
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/gim, '<ul>$1</ul>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr>');

    // Line breaks - convert double newlines to paragraphs
    html = html.split('\n\n').map(para => {
      // Don't wrap if already wrapped in a tag
      if (para.match(/^<[h|u|o|l|d]/)) {
        return para;
      }
      return '<p>' + para + '</p>';
    }).join('\n');

    return html;
  }
}

/**
 * Sanitize HTML output before innerHTML assignment.
 * Uses DOMPurify when available, falls back to stripping all tags.
 */
function safeHTML(html) {
  if (typeof DOMPurify !== 'undefined') {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'p', 'strong', 'em', 'a', 'ul', 'li', 'hr', 'br'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false
    });
  }
  // Fallback: escape all HTML if DOMPurify isn't loaded
  var div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

// Security Utilities
class SecurityUtils {
  /**
   * Sanitize text input by removing HTML tags, control characters, and null bytes
   * This prevents XSS attacks, injection attacks, and malformed data
   */
  static sanitizeText(input) {
    if (typeof input !== 'string') {
      return '';
    }

    let sanitized = input;

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Remove control characters (except tab, newline, carriage return)
    // Control characters are in the range \x00-\x1F and \x7F
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Remove HTML tags to prevent XSS
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove HTML entities that could be used for XSS
    sanitized = sanitized.replace(/&[#\w]+;/g, '');

    // Normalize whitespace (replace multiple spaces with single space)
    sanitized = sanitized.replace(/\s+/g, ' ');

    // Trim leading and trailing whitespace
    sanitized = sanitized.trim();

    return sanitized;
  }

  /**
   * Sanitize survey code - more restrictive, only allows alphanumeric, dash, underscore
   */
  static sanitizeSurveyCode(code) {
    if (typeof code !== 'string') {
      return '';
    }

    // Remove all characters that are not alphanumeric, dash, or underscore
    return code.replace(/[^a-zA-Z0-9_-]/g, '').trim();
  }

  /**
   * Validate survey code against API constraints
   */
  static validateSurveyCode(code) {
    const sanitized = this.sanitizeSurveyCode(code);

    if (sanitized.length < API_CONSTRAINTS.SURVEY_CODE.MIN_LENGTH ||
        sanitized.length > API_CONSTRAINTS.SURVEY_CODE.MAX_LENGTH) {
      return {
        valid: false,
        error: API_CONSTRAINTS.SURVEY_CODE.ERROR_MSG,
        sanitized: sanitized
      };
    }

    if (!API_CONSTRAINTS.SURVEY_CODE.PATTERN.test(sanitized)) {
      return {
        valid: false,
        error: API_CONSTRAINTS.SURVEY_CODE.ERROR_MSG,
        sanitized: sanitized
      };
    }

    return { valid: true, sanitized: sanitized };
  }

  /**
   * Validate question text against API constraints
   */
  static validateQuestion(text) {
    const sanitized = this.sanitizeText(text);

    if (sanitized.length < API_CONSTRAINTS.QUESTION.MIN_LENGTH ||
        sanitized.length > API_CONSTRAINTS.QUESTION.MAX_LENGTH) {
      return {
        valid: false,
        error: API_CONSTRAINTS.QUESTION.ERROR_MSG,
        sanitized: sanitized
      };
    }

    return { valid: true, sanitized: sanitized };
  }

  /**
   * Validate answer text against API constraints
   */
  static validateAnswer(text) {
    const sanitized = this.sanitizeText(text);

    if (sanitized.length < API_CONSTRAINTS.ANSWER.MIN_LENGTH ||
        sanitized.length > API_CONSTRAINTS.ANSWER.MAX_LENGTH) {
      return {
        valid: false,
        error: API_CONSTRAINTS.ANSWER.ERROR_MSG,
        sanitized: sanitized
      };
    }

    return { valid: true, sanitized: sanitized };
  }

  /**
   * Validate entire survey submission payload
   */
  static validateSurveyPayload(payload) {
    const errors = [];

    // Validate survey code
    const codeValidation = this.validateSurveyCode(payload.code);
    if (!codeValidation.valid) {
      errors.push(`Survey Code: ${codeValidation.error}`);
    }

    // Validate questions array
    if (!Array.isArray(payload.questions)) {
      errors.push('Questions must be an array');
      return { valid: false, errors: errors };
    }

    if (payload.questions.length < API_CONSTRAINTS.QUESTIONS_ARRAY.MIN_ITEMS ||
        payload.questions.length > API_CONSTRAINTS.QUESTIONS_ARRAY.MAX_ITEMS) {
      errors.push(API_CONSTRAINTS.QUESTIONS_ARRAY.ERROR_MSG);
    }

    // Validate each question-answer pair
    payload.questions.forEach((item, index) => {
      const questionValidation = this.validateQuestion(item.question);
      if (!questionValidation.valid) {
        errors.push(`Question ${index + 1}: ${questionValidation.error}`);
      }

      const answerValidation = this.validateAnswer(item.answer);
      if (!answerValidation.valid) {
        errors.push(`Answer ${index + 1}: ${answerValidation.error}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Sanitize entire survey payload before submission
   */
  static sanitizePayload(payload) {
    return {
      code: this.sanitizeSurveyCode(payload.code),
      questions: payload.questions.map(item => ({
        question: this.sanitizeText(item.question),
        answer: this.sanitizeText(item.answer)
      }))
    };
  }
}

// Survey State Management
class SurveyManager {
  constructor(config) {
    this.config = config;
    this.currentSectionIndex = 0;
    this.sections = config.sections || [];
    this.surveyCode = null; // Will be set when user enters code
    this.baseUrl = config.baseUrl || '';
    this.questions = {};
    this.sectionMetadata = {}; // Store section metadata from questions.json
    this.surveyState = {};
    this.currentStage = 'code-entry'; // Stages: code-entry, questions, thank-you

    // DOM Elements - Code Entry Stage
    this.codeEntryStage = document.getElementById('survey-code-entry');
    this.codeInput = document.getElementById('survey-code-input');
    this.startBtn = document.getElementById('start-survey-btn');
    this.messageEntryDiv = document.getElementById('survey-message-entry');

    // DOM Elements - Questions Stage
    this.questionsStage = document.getElementById('survey-questions-stage');
    this.questionsContainer = document.getElementById('survey-questions');
    this.prevBtn = document.getElementById('prev-btn');
    this.nextBtn = document.getElementById('next-btn');
    this.submitBtn = document.getElementById('submit-btn');
    this.progressBar = document.getElementById('survey-progress-bar');
    this.currentSectionSpan = document.getElementById('current-section');
    this.totalSectionsSpan = document.getElementById('total-sections');
    this.messageQuestionsDiv = document.getElementById('survey-message-questions');

    // DOM Elements - Thank You Stage
    this.thankYouStage = document.getElementById('survey-thank-you');

    this.init();
  }

  /**
   * Initialize the survey - Start with code entry stage
   */
  async init() {
    // Note: sections will be empty initially and loaded dynamically from config.json
    // when user enters a survey code, so no need to check sections.length here

    // Initialize consent checkbox logic
    this.initConsentCheckbox();

    // Attach event listeners for code entry
    this.attachCodeEntryListeners();

    // Show code entry stage (default)
    this.showStage('code-entry');
  }

  /**
   * Initialize consent checkbox and code input logic
   * Flow: User enters code -> loads intro.md -> user checks consent -> enables Start button
   */
  initConsentCheckbox() {
    const checkbox = document.getElementById('consent-checkbox');
    const codeInput = document.getElementById('survey-code-input');
    const startBtn = document.getElementById('start-survey-btn');

    if (!checkbox || !codeInput || !startBtn) {
      console.warn('Consent checkbox elements not found');
      return;
    }

    // Code input is enabled from start (not gated by consent)
    codeInput.disabled = false;

    // When user types code, auto-load intro.md when 5 chars entered
    codeInput.addEventListener('input', async (e) => {
      const code = e.target.value.trim().toUpperCase();
      e.target.value = code; // Show uppercase

      // Hide consent section if code length is not 5 (user is editing)
      const consentSection = document.getElementById('research-consent');
      const codeHint = document.getElementById('code-hint');

      if (code.length !== 5) {
        if (consentSection) consentSection.style.display = 'none';
        if (codeHint) codeHint.style.display = 'block';

        // Uncheck consent checkbox if it was checked
        const checkbox = document.getElementById('consent-checkbox');
        if (checkbox) checkbox.checked = false;
      }

      // When code reaches 5 characters, load intro.md for that survey
      if (code.length === 5) {
        // Temporarily set survey code to load intro
        const previousCode = this.surveyCode;
        this.surveyCode = code;

        // Load intro content for this survey code
        await this.loadSurveyIntro();

        // Reset if not starting survey yet
        if (!previousCode) {
          this.surveyCode = null;
        }
      }

      // Enable Start button only if code is 5 chars AND consent is checked
      this.updateStartButtonState();
    });

    // When consent checkbox changes, update Start button
    checkbox.addEventListener('change', () => {
      this.updateStartButtonState();
    });
  }

  /**
   * Update Start Survey button state based on code and consent
   */
  updateStartButtonState() {
    const checkbox = document.getElementById('consent-checkbox');
    const codeInput = document.getElementById('survey-code-input');
    const startBtn = document.getElementById('start-survey-btn');

    if (!checkbox || !codeInput || !startBtn) return;

    const code = codeInput.value.trim();
    const hasValidCode = code.length === 5;
    const hasConsent = checkbox.checked;

    startBtn.disabled = !(hasValidCode && hasConsent);
  }

  /**
   * Load survey intro (consent) from intro.md
   */
  async loadSurveyIntro() {
    if (!this.surveyCode) {
      console.error('Survey code not set');
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/assets/surveys/${this.surveyCode}/intro.md`);
      if (!response.ok) {
        throw new Error(`Failed to load intro.md: ${response.status}`);
      }
      const markdown = await response.text();
      const html = MarkdownParser.parse(markdown);

      const container = document.getElementById('consent-content-container');
      if (container) {
        container.innerHTML = safeHTML(html);
      }

      // Show the consent section (which includes the start button)
      const consentSection = document.getElementById('research-consent');

      if (consentSection) {
        consentSection.style.display = 'block';
      }

      // Hide the code hint since consent is now visible
      const codeHint = document.getElementById('code-hint');
      if (codeHint) {
        codeHint.style.display = 'none';
      }

      console.log(`Loaded intro.md for survey: ${this.surveyCode}`);
    } catch (error) {
      console.error('Error loading intro:', error);
      this.showError(`Failed to load consent information for survey code "${this.surveyCode}". Please verify the code is correct.`, 'code-entry');
    }
  }

  /**
   * Load survey appendix (thank you content) from appendix.md
   */
  async loadAppendix() {
    if (!this.surveyCode) {
      console.error('Survey code not set');
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/assets/surveys/${this.surveyCode}/appendix.md`);
      if (!response.ok) {
        throw new Error(`Failed to load appendix.md: ${response.status}`);
      }
      const markdown = await response.text();
      const html = MarkdownParser.parse(markdown);

      const container = document.getElementById('appendix-content-container');
      if (container) {
        container.innerHTML = safeHTML(html);
      }
    } catch (error) {
      console.error('Error loading appendix:', error);
      // Don't show error to user, just log it
    }
  }

  /**
   * Load survey configuration from config.json
   * This dynamically loads sections based on the survey code
   */
  async loadConfig() {
    if (!this.surveyCode) {
      console.error('Survey code not set');
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/assets/surveys/${this.surveyCode}/config.json`);
      if (!response.ok) {
        throw new Error(`Failed to load config.json: ${response.status}`);
      }
      const config = await response.json();

      // Extract sections from config
      if (config.survey && config.survey.sections) {
        this.sections = config.survey.sections;

        // Update survey title if available
        if (config.survey.title && document.getElementById('survey-title-main')) {
          document.getElementById('survey-title-main').textContent = config.survey.title;
        }

        console.log(`Loaded config for survey: ${config.survey.code}, ${this.sections.length} sections`);
      } else {
        throw new Error('Invalid config.json structure');
      }
    } catch (error) {
      console.error('Error loading config:', error);
      throw new Error(`Cannot load survey configuration: ${error.message}`);
    }
  }

  /**
   * Attach event listeners for code entry stage
   */
  attachCodeEntryListeners() {
    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => this.handleStartSurvey());
    }

    // Allow Enter key to start survey
    if (this.codeInput) {
      this.codeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleStartSurvey();
        }
      });
    }
  }

  /**
   * Handle survey start when user enters code
   */
  async handleStartSurvey() {
    const enteredCode = this.codeInput ? this.codeInput.value.trim() : '';

    if (!enteredCode) {
      this.showError('Please enter a survey code.', 'code-entry');
      return;
    }

    // Validate survey code against API constraints
    const codeValidation = SecurityUtils.validateSurveyCode(enteredCode);
    if (!codeValidation.valid) {
      this.showError(`Invalid survey code: ${codeValidation.error}`, 'code-entry');
      return;
    }

    // Use sanitized survey code
    this.surveyCode = codeValidation.sanitized;

    // Disable start button while loading
    if (this.startBtn) {
      this.startBtn.disabled = true;
      this.startBtn.textContent = 'Loading...';
    }

    try {
      // Load survey configuration (sections, title, etc.) from config.json
      await this.loadConfig();

      // Load survey state from localStorage
      this.surveyState = this.loadSurveyState();

      // Set total sections
      if (this.totalSectionsSpan) {
        this.totalSectionsSpan.textContent = this.sections.length;
      }

      // Attach event listeners for questions stage
      this.attachQuestionListeners();

      // Load all section questions
      await this.loadAllQuestions();

      // Transition to questions stage
      this.showStage('questions');

      // Display first section
      this.displaySection(0);

    } catch (error) {
      console.error('Error starting survey:', error);
      this.showError(`Failed to load survey: ${error.message}`, 'code-entry');

      // Re-enable start button
      if (this.startBtn) {
        this.startBtn.disabled = false;
        this.startBtn.textContent = 'Start Survey';
      }
    }
  }

  /**
   * Show a specific stage and hide others
   */
  showStage(stage) {
    this.currentStage = stage;

    // Hide all stages
    if (this.codeEntryStage) this.codeEntryStage.style.display = 'none';
    if (this.questionsStage) this.questionsStage.style.display = 'none';
    if (this.thankYouStage) this.thankYouStage.style.display = 'none';

    // Show requested stage
    switch (stage) {
      case 'code-entry':
        if (this.codeEntryStage) this.codeEntryStage.style.display = 'block';
        document.body.classList.remove('survey-active');
        break;
      case 'questions':
        if (this.questionsStage) this.questionsStage.style.display = 'block';
        document.body.classList.add('survey-active');
        break;
      case 'thank-you':
        if (this.thankYouStage) this.thankYouStage.style.display = 'block';
        document.body.classList.remove('survey-active');
        break;
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Attach event listeners to navigation buttons (questions stage)
   */
  attachQuestionListeners() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.navigatePrevious());
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.navigateNext());
    }

    if (this.submitBtn) {
      this.submitBtn.addEventListener('click', () => this.submitSurvey());
    }
  }

  /**
   * Load questions for all sections from JSON files
   */
  async loadAllQuestions() {
    const loadPromises = this.sections.map(async (section) => {
      const url = `${this.baseUrl}/assets/surveys/${this.surveyCode}/${section.name}/questions.json`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to load questions for section: ${section.name}`);
        }
        const data = await response.json();
        this.questions[section.name] = data.questions || [];
        // Store section metadata (title, description, etc.) from questions.json
        if (data.section) {
          this.sectionMetadata[section.name] = data.section;
        }
      } catch (error) {
        console.error(`Error loading questions for ${section.name}:`, error);
        this.questions[section.name] = [];
      }
    });

    await Promise.all(loadPromises);
  }

  /**
   * Display a specific section
   */
  displaySection(index) {
    if (index < 0 || index >= this.sections.length) {
      return;
    }

    this.currentSectionIndex = index;
    const section = this.sections[index];
    const sectionQuestions = this.questions[section.name] || [];

    // Update progress
    this.updateProgress();

    // Clear container
    this.questionsContainer.innerHTML = '';

    // Add section title
    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'section-title';
    sectionTitle.textContent = section.title;
    this.questionsContainer.appendChild(sectionTitle);

    // Add section description if available
    // Prioritize description from questions.json (sectionMetadata), fall back to config.json
    const metadata = this.sectionMetadata[section.name];
    const description = (metadata && metadata.description) || section.description;

    if (description) {
      const sectionDescription = document.createElement('p');
      sectionDescription.className = 'section-description text-muted';
      sectionDescription.textContent = description;
      this.questionsContainer.appendChild(sectionDescription);
    }

    // Render questions
    if (sectionQuestions.length === 0) {
      const noQuestions = document.createElement('p');
      noQuestions.className = 'text-muted';
      noQuestions.textContent = 'No questions available for this section.';
      this.questionsContainer.appendChild(noQuestions);
    } else {
      sectionQuestions.forEach(question => {
        this.renderQuestion(question, section.name);
      });
    }

    // Update navigation buttons
    this.updateNavigationButtons();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Render a likert table question
   */
  renderLikertTable(question) {
    const container = document.createElement('div');
    container.className = 'likert-table-question';
    container.dataset.questionId = question.id;

    // Question text
    const questionText = document.createElement('div');
    questionText.className = 'likert-question-text';
    questionText.textContent = question.text;
    container.appendChild(questionText);

    // Hint
    if (question.hint) {
      const hint = document.createElement('div');
      hint.className = 'likert-question-hint';
      hint.textContent = question.hint;
      container.appendChild(hint);
    }

    // Table container
    const tableContainer = document.createElement('div');
    tableContainer.className = 'likert-table-container';

    const table = document.createElement('table');
    table.className = 'likert-table';

    // Header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const emptyTh = document.createElement('th');
    emptyTh.className = 'row-header';
    emptyTh.textContent = '';
    headerRow.appendChild(emptyTh);

    (question.scale_options || []).forEach(option => {
      const th = document.createElement('th');
      th.textContent = option.label;
      th.className = option.skip_option ? 'skip-option' : '';
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body rows
    const tbody = document.createElement('tbody');
    (question.rows || []).forEach((row, rowIdx) => {
      const tr = document.createElement('tr');

      // Row label cell
      const labelTd = document.createElement('td');
      labelTd.className = 'row-label';

      const labelContent = document.createElement('div');
      labelContent.textContent = row.label;
      labelTd.appendChild(labelContent);

      if (row.description) {
        const desc = document.createElement('span');
        desc.className = 'row-description';
        desc.textContent = row.description;
        labelTd.appendChild(desc);
      }

      tr.appendChild(labelTd);

      // Radio cells for each scale option
      (question.scale_options || []).forEach((option, colIdx) => {
        const td = document.createElement('td');
        td.className = 'radio-cell';
        td.setAttribute('data-label', option.label); // For mobile CSS

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = `${question.id}_${row.id}`;
        radio.value = option.value;
        radio.id = `${question.id}_${row.id}_${colIdx}`;

        // Set required based on question.required_rows
        if (question.required_rows === 'all' || (question.required_rows === 'partial' && row.required)) {
          radio.required = true;
        }

        // Load saved answer
        const savedAnswer = this.surveyState[`${question.id}_${row.id}`];
        if (savedAnswer === option.value) {
          radio.checked = true;
        }

        radio.addEventListener('change', (e) => {
          this.saveAnswer(`${question.id}_${row.id}`, e.target.value);
        });

        const label = document.createElement('label');
        label.htmlFor = radio.id;
        label.appendChild(radio);

        td.appendChild(label);
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);
    container.appendChild(tableContainer);

    return container;
  }

  /**
   * Render a single question
   */
  renderQuestion(question, sectionName) {
    // Handle likert-table separately as it has its own complete structure
    if (question.type === 'likert-table') {
      const likertElement = this.renderLikertTable(question);
      this.questionsContainer.appendChild(likertElement);
      return;
    }

    const questionDiv = document.createElement('div');
    questionDiv.className = 'survey-question';
    questionDiv.dataset.questionId = question.id;

    // Question label
    const label = document.createElement('label');
    label.className = 'form-label';
    label.htmlFor = `q_${question.id}`;
    label.textContent = question.text;
    if (question.required) {
      var asterisk = document.createElement('span');
      asterisk.className = 'text-danger';
      asterisk.textContent = ' *';
      label.appendChild(asterisk);
    }
    questionDiv.appendChild(label);

    // Hint text
    if (question.hint) {
      const hint = document.createElement('small');
      hint.className = 'form-text text-muted';
      hint.textContent = question.hint;
      questionDiv.appendChild(hint);
    }

    // Get saved answer if exists
    const savedAnswer = this.surveyState[question.id];

    // Render input based on type
    switch (question.type) {
      case 'text':
      case 'email':
        const input = document.createElement('input');
        input.type = question.type;
        input.id = `q_${question.id}`;
        input.className = 'form-control';
        input.name = question.id;
        // Use max_chars from question or API constraint
        const inputMaxChars = question.max_chars || API_CONSTRAINTS.ANSWER.MAX_LENGTH;
        input.maxLength = inputMaxChars;
        if (question.required) input.required = true;
        if (question.placeholder) input.placeholder = question.placeholder;
        if (savedAnswer) input.value = savedAnswer;
        input.addEventListener('change', (e) => this.saveAnswer(question.id, e.target.value));
        // Add real-time validation feedback
        input.addEventListener('input', (e) => {
          if (e.target.value.length > inputMaxChars - 100) {
            const remaining = inputMaxChars - e.target.value.length;
            input.title = `${remaining} characters remaining`;
          }
        });
        questionDiv.appendChild(input);
        break;

      case 'number':
        const numberInput = document.createElement('input');
        numberInput.type = 'number';
        numberInput.id = `q_${question.id}`;
        numberInput.className = 'form-control';
        numberInput.name = question.id;
        if (question.min !== undefined) numberInput.min = question.min;
        if (question.max !== undefined) numberInput.max = question.max;
        if (question.step !== undefined) numberInput.step = question.step;
        if (question.required) numberInput.required = true;
        if (question.placeholder) numberInput.placeholder = question.placeholder;
        if (savedAnswer) numberInput.value = savedAnswer;
        numberInput.addEventListener('change', (e) => this.saveAnswer(question.id, e.target.value));
        questionDiv.appendChild(numberInput);
        break;

      case 'textarea':
        const textarea = document.createElement('textarea');
        textarea.id = `q_${question.id}`;
        textarea.className = 'form-control';
        textarea.name = question.id;
        textarea.rows = question.default_rows || 4;

        // Use max_chars from YAML or API constraint as fallback
        const maxChars = question.max_chars || API_CONSTRAINTS.ANSWER.MAX_LENGTH;
        const minChars = question.min_chars || 0;
        textarea.maxLength = maxChars;

        if (question.required) textarea.required = true;
        if (question.placeholder) textarea.placeholder = question.placeholder;
        if (savedAnswer) textarea.value = savedAnswer;

        textarea.addEventListener('change', (e) => this.saveAnswer(question.id, e.target.value));
        questionDiv.appendChild(textarea);

        // Add character counter if requested
        if (question.show_char_count) {
          const counter = document.createElement('span');
          counter.className = 'char-counter';
          counter.id = `counter_${question.id}`;

          const updateCounter = () => {
            const length = textarea.value.length;
            const remaining = maxChars - length;

            counter.textContent = `${length} / ${maxChars} characters`;

            // Apply styling based on character count
            if (length < minChars) {
              counter.className = 'char-counter error';
            } else if (remaining < 100) {
              counter.className = 'char-counter warning';
            } else {
              counter.className = 'char-counter';
            }
          };

          textarea.addEventListener('input', updateCounter);
          questionDiv.appendChild(counter);
          updateCounter(); // Initialize
        }

        // Add guidance text if provided
        if (question.guidance) {
          const guidance = document.createElement('span');
          guidance.className = 'question-guidance';
          guidance.textContent = question.guidance;
          questionDiv.appendChild(guidance);
        }
        break;

      case 'radio':
        const radioGroup = document.createElement('div');
        radioGroup.className = 'radio-group';
        (question.options || []).forEach((option, idx) => {
          const radioDiv = document.createElement('div');
          radioDiv.className = 'form-check';

          // Handle both string options and object options
          const optionLabel = typeof option === 'string' ? option : option.label;
          const optionValue = typeof option === 'string' ? option : option.value;
          const hasTextInput = typeof option === 'object' && option.has_text_input;
          const textPlaceholder = typeof option === 'object' ? option.text_placeholder : '';

          const radioInput = document.createElement('input');
          radioInput.type = 'radio';
          radioInput.id = `q_${question.id}_${idx}`;
          radioInput.className = 'form-check-input';
          radioInput.name = question.id;
          radioInput.value = optionValue;
          if (question.required) radioInput.required = true;

          // Check if this option is selected
          const isSelected = savedAnswer && (savedAnswer === optionValue || savedAnswer.startsWith(`${optionValue}:`));
          if (isSelected) radioInput.checked = true;

          const radioLabel = document.createElement('label');
          radioLabel.className = 'form-check-label';
          radioLabel.htmlFor = `q_${question.id}_${idx}`;
          radioLabel.textContent = optionLabel;

          radioDiv.appendChild(radioInput);
          radioDiv.appendChild(radioLabel);

          // Add text input for "Other" option if specified
          if (hasTextInput) {
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.className = 'form-control mt-2 other-text-input';
            textInput.placeholder = textPlaceholder || 'Please specify';
            textInput.id = `q_${question.id}_${idx}_text`;
            textInput.style.display = isSelected ? 'block' : 'none';

            // Extract text value if exists
            if (isSelected && savedAnswer.includes(':')) {
              textInput.value = savedAnswer.split(':')[1];
            }

            radioInput.addEventListener('change', (e) => {
              // Show/hide text input when radio is selected
              const allTextInputs = radioGroup.querySelectorAll('.other-text-input');
              allTextInputs.forEach(ti => ti.style.display = 'none');

              if (e.target.checked) {
                textInput.style.display = 'block';
                textInput.focus();
              }

              // Save combined value
              const textValue = textInput.value.trim();
              this.saveAnswer(question.id, textValue ? `${optionValue}:${textValue}` : optionValue);
            });

            textInput.addEventListener('input', (e) => {
              // Update saved answer with text
              const textValue = e.target.value.trim();
              this.saveAnswer(question.id, textValue ? `${optionValue}:${textValue}` : optionValue);
            });

            radioDiv.appendChild(textInput);
          } else {
            radioInput.addEventListener('change', (e) => {
              // Hide all "other" text inputs when non-other options are selected
              const allTextInputs = radioGroup.querySelectorAll('.other-text-input');
              allTextInputs.forEach(ti => ti.style.display = 'none');

              this.saveAnswer(question.id, e.target.value);
            });
          }

          radioGroup.appendChild(radioDiv);
        });
        questionDiv.appendChild(radioGroup);
        break;

      case 'checkbox':
        const checkboxGroup = document.createElement('div');
        checkboxGroup.className = 'checkbox-group';
        const savedAnswers = savedAnswer ? (Array.isArray(savedAnswer) ? savedAnswer : [savedAnswer]) : [];

        // Debug logging
        console.log(`Rendering checkbox ${question.id}, savedAnswer:`, savedAnswer, 'savedAnswers:', savedAnswers);

        (question.options || []).forEach((option, idx) => {
          const checkDiv = document.createElement('div');
          checkDiv.className = 'form-check';

          // Handle both string options and object options
          const optionLabel = typeof option === 'string' ? option : option.label;
          const optionValue = typeof option === 'string' ? option : option.value;
          const isExclusive = typeof option === 'object' && option.exclusive === true;
          const hasTextInput = typeof option === 'object' && option.has_text_input;
          const textPlaceholder = typeof option === 'object' ? option.text_placeholder : '';

          const checkInput = document.createElement('input');
          checkInput.type = 'checkbox';
          checkInput.id = `q_${question.id}_${idx}`;
          checkInput.className = 'form-check-input';
          checkInput.name = question.id;
          checkInput.value = optionValue;
          checkInput.dataset.exclusive = isExclusive ? 'true' : 'false';

          // Check if this option is selected
          const isSelected = savedAnswers.some(ans => ans === optionValue || ans.startsWith(`${optionValue}:`));
          if (isSelected) checkInput.checked = true;

          const checkLabel = document.createElement('label');
          checkLabel.className = 'form-check-label';
          checkLabel.htmlFor = `q_${question.id}_${idx}`;
          checkLabel.textContent = optionLabel;

          checkDiv.appendChild(checkInput);
          checkDiv.appendChild(checkLabel);

          // Add text input for options with has_text_input
          if (hasTextInput) {
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.className = 'form-control mt-2 other-text-input';
            textInput.placeholder = textPlaceholder || 'Please specify';
            textInput.id = `q_${question.id}_${idx}_text`;
            textInput.style.display = isSelected ? 'block' : 'none';

            // Extract text value if exists
            const savedWithText = savedAnswers.find(ans => ans.startsWith(`${optionValue}:`));
            if (savedWithText) {
              textInput.value = savedWithText.split(':')[1];
            }

            checkInput.addEventListener('change', (e) => {
              if (e.target.checked) {
                textInput.style.display = 'block';
                textInput.focus();
              } else {
                textInput.style.display = 'none';
              }
              updateCheckboxAnswers(e);
            });

            textInput.addEventListener('input', (e) => updateCheckboxAnswers(e));
            checkDiv.appendChild(textInput);
          } else {
            checkInput.addEventListener('change', (e) => updateCheckboxAnswers(e));
          }

          checkboxGroup.appendChild(checkDiv);
        });

        // Function to update checkbox answers with exclusive logic
        function updateCheckboxAnswers(event) {
          const allCheckboxes = checkboxGroup.querySelectorAll('input[type="checkbox"]');
          const clickedCheckbox = event?.target;

          // If an exclusive checkbox was checked, uncheck all others
          if (clickedCheckbox?.checked && clickedCheckbox.dataset.exclusive === 'true') {
            allCheckboxes.forEach(cb => {
              if (cb !== clickedCheckbox) {
                cb.checked = false;
                // Hide text inputs
                const textInput = cb.parentElement.querySelector('.other-text-input');
                if (textInput) textInput.style.display = 'none';
              }
            });
          }

          // If any non-exclusive checkbox was checked, uncheck exclusive ones
          if (clickedCheckbox?.checked && clickedCheckbox.dataset.exclusive === 'false') {
            allCheckboxes.forEach(cb => {
              if (cb.dataset.exclusive === 'true') {
                cb.checked = false;
              }
            });
          }

          // Collect all checked values
          const values = [];
          allCheckboxes.forEach(cb => {
            if (cb.checked) {
              const textInput = cb.parentElement.querySelector('.other-text-input');
              if (textInput && textInput.style.display !== 'none') {
                const textValue = textInput.value.trim();
                values.push(textValue ? `${cb.value}:${textValue}` : cb.value);
              } else {
                values.push(cb.value);
              }
            }
          });

          this.saveAnswer(question.id, values);
        }

        // Bind the update function to the manager instance
        updateCheckboxAnswers = updateCheckboxAnswers.bind(this);

        questionDiv.appendChild(checkboxGroup);
        break;

      case 'select':
        const select = document.createElement('select');
        select.id = `q_${question.id}`;
        select.className = 'form-select';
        select.name = question.id;
        if (question.required) select.required = true;

        // Add default placeholder option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = question.placeholder || '-- Select an option --';
        defaultOption.disabled = true;
        defaultOption.selected = !savedAnswer;
        select.appendChild(defaultOption);

        // Add options (handle both string and object formats)
        (question.options || []).forEach(option => {
          const optionElement = document.createElement('option');

          // Handle both string options and object options
          const optionLabel = typeof option === 'string' ? option : option.label;
          const optionValue = typeof option === 'string' ? option : option.value;

          optionElement.value = optionValue;
          optionElement.textContent = optionLabel;
          if (savedAnswer === optionValue) {
            optionElement.selected = true;
          }
          select.appendChild(optionElement);
        });

        select.addEventListener('change', (e) => this.saveAnswer(question.id, e.target.value));
        questionDiv.appendChild(select);
        break;

      default:
        const unknownType = document.createElement('p');
        unknownType.className = 'text-danger';
        unknownType.textContent = `Unknown question type: ${question.type}`;
        questionDiv.appendChild(unknownType);
    }

    this.questionsContainer.appendChild(questionDiv);
  }

  /**
   * Save answer to survey state with sanitization
   */
  saveAnswer(questionId, value) {
    // Sanitize the value before saving
    let sanitizedValue = value;

    if (typeof value === 'string') {
      sanitizedValue = SecurityUtils.sanitizeText(value);
    } else if (Array.isArray(value)) {
      // For checkbox arrays, sanitize each value and filter out empty strings
      sanitizedValue = value
        .map(v => typeof v === 'string' ? SecurityUtils.sanitizeText(v) : String(v))
        .filter(v => v && v.length > 0); // Remove empty values
    }

    this.surveyState[questionId] = sanitizedValue;
    this.saveSurveyState();

    // Debug logging
    console.log(`Saved answer for ${questionId}:`, sanitizedValue);
  }

  /**
   * Validate current section
   */
  validateCurrentSection() {
    const section = this.sections[this.currentSectionIndex];
    const sectionQuestions = this.questions[section.name] || [];
    const errors = [];

    sectionQuestions.forEach(question => {
      if (question.required) {
        const answer = this.surveyState[question.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          errors.push(question.text);
        }
      }
    });

    if (errors.length > 0) {
      this.showError(`Please answer the following required questions:\n- ${errors.join('\n- ')}`, 'questions');
      return false;
    }

    return true;
  }

  /**
   * Navigate to previous section
   */
  navigatePrevious() {
    if (this.currentSectionIndex > 0) {
      this.displaySection(this.currentSectionIndex - 1);
    }
  }

  /**
   * Navigate to next section
   */
  navigateNext() {
    // Validate current section
    if (!this.validateCurrentSection()) {
      return;
    }

    if (this.currentSectionIndex < this.sections.length - 1) {
      this.displaySection(this.currentSectionIndex + 1);
    }
  }

  /**
   * Update navigation buttons visibility
   */
  updateNavigationButtons() {
    // Previous button
    if (this.prevBtn) {
      this.prevBtn.style.display = this.currentSectionIndex > 0 ? 'inline-block' : 'none';
    }

    // Next button
    if (this.nextBtn) {
      this.nextBtn.style.display = this.currentSectionIndex < this.sections.length - 1 ? 'inline-block' : 'none';
    }

    // Submit button (show on last section)
    if (this.submitBtn) {
      this.submitBtn.style.display = this.currentSectionIndex === this.sections.length - 1 ? 'inline-block' : 'none';
    }
  }

  /**
   * Update progress bar
   */
  updateProgress() {
    const progress = ((this.currentSectionIndex + 1) / this.sections.length) * 100;

    if (this.progressBar) {
      this.progressBar.style.width = `${progress}%`;
      this.progressBar.setAttribute('aria-valuenow', progress);
    }

    if (this.currentSectionSpan) {
      this.currentSectionSpan.textContent = this.currentSectionIndex + 1;
    }
  }

  /**
   * Submit survey to Cloud Run API with validation and sanitization
   */
  async submitSurvey() {
    // Validate final section
    if (!this.validateCurrentSection()) {
      return;
    }

    // Check if Cloud Run endpoint is configured
    if (CLOUD_RUN_ENDPOINT === "YOUR_CLOUD_RUN_API_URL_HERE") {
      this.showError('Survey submission is not configured. Please update the CLOUD_RUN_ENDPOINT in survey.js with your actual Cloud Run API URL.', 'questions');
      return;
    }

    // Disable submit button
    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn.textContent = 'Submitting...';
    }

    try {
      // Prepare submission payload in the format expected by Cloud Run API
      // Transform answers from { questionId: answer } to [ { question: text, answer: value } ]
      const questionsArray = [];

      // Iterate through all sections and questions to build the questions array
      this.sections.forEach(section => {
        const sectionQuestions = this.questions[section.name] || [];
        sectionQuestions.forEach(question => {
          const answer = this.surveyState[question.id];
          if (answer !== undefined && answer !== null && answer !== '') {
            // Handle array answers (checkboxes) by joining them
            const answerValue = Array.isArray(answer) ? answer.join(', ') : answer;
            questionsArray.push({
              question: question.text,
              answer: answerValue
            });
          }
        });
      });

      // Build raw payload
      const rawPayload = {
        code: this.surveyCode,
        questions: questionsArray
      };

      // Sanitize the entire payload
      const sanitizedPayload = SecurityUtils.sanitizePayload(rawPayload);

      // Validate the sanitized payload against API constraints
      const validation = SecurityUtils.validateSurveyPayload(sanitizedPayload);

      if (!validation.valid) {
        // Show validation errors to the user
        const errorMessage = 'Survey validation failed:\n' + validation.errors.join('\n');
        this.showError(errorMessage, 'questions');

        // Re-enable submit button
        if (this.submitBtn) {
          this.submitBtn.disabled = false;
          this.submitBtn.textContent = 'Submit Survey';
        }
        return;
      }

      // Check for maximum questions limit
      if (sanitizedPayload.questions.length > API_CONSTRAINTS.QUESTIONS_ARRAY.MAX_ITEMS) {
        this.showError(`Survey has too many questions. Maximum allowed: ${API_CONSTRAINTS.QUESTIONS_ARRAY.MAX_ITEMS}`, 'questions');
        if (this.submitBtn) {
          this.submitBtn.disabled = false;
          this.submitBtn.textContent = 'Submit Survey';
        }
        return;
      }

      // Send sanitized and validated payload to Cloud Run API
      const response = await fetch(CLOUD_RUN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedPayload)
      });

      // Handle API response
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        let errorMessage = `Server responded with status: ${response.status}`;

        if (response.status === 422 && errorData?.detail) {
          // Validation error from API
          errorMessage = 'Validation error: ' + JSON.stringify(errorData.detail);
        } else if (response.status === 429) {
          // Rate limit exceeded
          errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        } else if (errorData?.detail) {
          errorMessage = errorData.detail;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();

      // Clear survey state on success
      this.clearSurveyState();

      // Load appendix content for thank you page
      await this.loadAppendix();

      // Transition to thank you stage
      this.showStage('thank-you');

    } catch (error) {
      console.error('Submission error:', error);
      this.showError(`Failed to submit survey: ${error.message}. Please try again or contact support.`, 'questions');

      // Re-enable submit button
      if (this.submitBtn) {
        this.submitBtn.disabled = false;
        this.submitBtn.textContent = 'Submit Survey';
      }
    }
  }

  /**
   * Load survey state from localStorage
   */
  loadSurveyState() {
    try {
      const stateKey = `survey_state_${this.surveyCode}`;
      const saved = localStorage.getItem(stateKey);
      const state = saved ? JSON.parse(saved) : {};
      console.log('Loaded survey state:', state);
      return state;
    } catch (error) {
      console.error('Error loading survey state:', error);
      return {};
    }
  }

  /**
   * Save survey state to localStorage
   */
  saveSurveyState() {
    try {
      const stateKey = `survey_state_${this.surveyCode}`;
      localStorage.setItem(stateKey, JSON.stringify(this.surveyState));
    } catch (error) {
      console.error('Error saving survey state:', error);
    }
  }

  /**
   * Clear survey state from localStorage
   */
  clearSurveyState() {
    try {
      const stateKey = `survey_state_${this.surveyCode}`;
      localStorage.removeItem(stateKey);
      this.surveyState = {};
    } catch (error) {
      console.error('Error clearing survey state:', error);
    }
  }

  /**
   * Show error message in the appropriate stage
   */
  showError(message, stage = null) {
    const targetStage = stage || this.currentStage;
    let messageDiv = null;

    // Select the correct message div based on stage
    switch (targetStage) {
      case 'code-entry':
        messageDiv = this.messageEntryDiv;
        break;
      case 'questions':
        messageDiv = this.messageQuestionsDiv;
        break;
      default:
        messageDiv = this.messageQuestionsDiv;
    }

    if (messageDiv) {
      messageDiv.className = 'alert alert-danger';
      messageDiv.textContent = message;
      messageDiv.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Auto-hide after 10 seconds
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 10000);
    }
  }

  /**
   * Show success message in the appropriate stage
   */
  showSuccess(message, stage = null) {
    const targetStage = stage || this.currentStage;
    let messageDiv = null;

    // Select the correct message div based on stage
    switch (targetStage) {
      case 'code-entry':
        messageDiv = this.messageEntryDiv;
        break;
      case 'questions':
        messageDiv = this.messageQuestionsDiv;
        break;
      default:
        messageDiv = this.messageQuestionsDiv;
    }

    if (messageDiv) {
      messageDiv.className = 'alert alert-success';
      messageDiv.textContent = message;
      messageDiv.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

// Initialize survey when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.SURVEY_CONFIG) {
    new SurveyManager(window.SURVEY_CONFIG);
  }
});
