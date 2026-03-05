import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { calculatorService } from '../services/calculator.service.js';

vi.mock('../services/calculator.service.js', () => {
  return {
    calculatorService: {
      calculateWorkingHours: vi.fn(),
      getHolidaysList: vi.fn(),
    },
  };
});

describe('API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/work-hours', () => {
    it('should return 400 if start or end are missing', async () => {
      const response = await request(app)
        .post('/api/v1/work-hours')
        .send({ start: '2026-03-01' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return working hours if request is valid', async () => {
      vi.mocked(calculatorService.calculateWorkingHours).mockResolvedValue(40);

      const response = await request(app)
        .post('/api/v1/work-hours')
        .send({ start: '2026-03-01', end: '2026-03-07' });

      expect(response.status).toBe(200);
      expect(response.body.workHours).toBe(40);
      expect(response.body.period.start).toBe('2026-03-01');
    });

    it('should return 500 if calculation fails', async () => {
      vi.mocked(calculatorService.calculateWorkingHours).mockRejectedValue(new Error('Test Error'));

      const response = await request(app)
        .post('/api/v1/work-hours')
        .send({ start: '2026-03-01', end: '2026-03-07' });

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/v1/holidays', () => {
    it('should return 400 if start or end query parameters are missing', async () => {
      const response = await request(app).get('/api/v1/holidays?start=2026-03-01');
      expect(response.status).toBe(400);
    });

    it('should return holiday list if request is valid', async () => {
      vi.mocked(calculatorService.getHolidaysList).mockResolvedValue(['1/1', '1/2', '1/3']);

      const response = await request(app).get('/api/v1/holidays?start=2026-01-01&end=2026-01-03');

      expect(response.status).toBe(200);
      expect(response.body.holidays).toEqual(['1/1', '1/2', '1/3']);
    });
  });
});
