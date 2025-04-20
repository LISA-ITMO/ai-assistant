class ResearchAPI {
  constructor(api) {
    this.api = api;
  }

  async generateReport(data) {
    try {
      const response = await this.api.post('/api/research/generate-report', data);
      if (!response.data) {
        throw new Error('No data received from server');
      }
      return response.data.report || response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Error generating report');
      }
      throw error;
    }
  }
}

export default ResearchAPI; 