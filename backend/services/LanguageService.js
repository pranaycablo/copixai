const { TranslationServiceClient } = require('@google-cloud/translate');

// Note: This requires GOOGLE_APPLICATION_CREDENTIALS to be set in .env
class LanguageService {
  constructor() {
    this.client = new TranslationServiceClient();
    this.projectId = process.env.GOOGLE_PROJECT_ID || 'heroai-project';
    this.location = 'global';
  }

  /**
   * Translates text into the target language using Google Cloud Translation V3.
   */
  async translateText(text, targetLanguage = 'en') {
    try {
      // If no credentials, return original text
      if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.warn("[LanguageService] Google Credentials missing. Returning original text.");
        return text;
      }

      const request = {
        parent: `projects/${this.projectId}/locations/${this.location}`,
        contents: [text],
        mimeType: 'text/plain',
        targetLanguageCode: targetLanguage,
      };

      const [response] = await this.client.translateText(request);
      return response.translations[0].translatedText;
    } catch (error) {
      console.error("[LanguageService] Translation Error:", error);
      return text;
    }
  }

  /**
   * Detects the language of a given text.
   */
  async detectLanguage(text) {
    try {
      if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) return 'en';

      const request = {
        parent: `projects/${this.projectId}/locations/${this.location}`,
        content: text,
        mimeType: 'text/plain',
      };

      const [response] = await this.client.detectLanguage(request);
      return response.languages[0].languageCode;
    } catch (error) {
      return 'en';
    }
  }
}

module.exports = new LanguageService();

