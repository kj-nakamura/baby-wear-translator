import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { calculatorService } from '../services/calculator.service';

vi.mock('../services/calculator.service', () => {
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
    it('should return 400 if month and period are missing', async () => {
      const response = await request(app)
        .post('/api/v1/work-hours')
        .send({ start: '2026-03-01' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should resolve a month to its full period', async () => {
      vi.mocked(calculatorService.calculateWorkingHours).mockResolvedValue(168);

      const response = await request(app)
        .post('/api/v1/work-hours')
        .send({ month: '2026-03' });

      expect(response.status).toBe(200);
      expect(response.body.workHours).toBe(168);
      expect(response.body.period).toEqual({ start: '2026-03-01', end: '2026-03-31' });
      expect(calculatorService.calculateWorkingHours).toHaveBeenCalledWith('2026-03-01', '2026-03-31', []);
    });

    it('should return working hours if request is valid', async () => {
      vi.mocked(calculatorService.calculateWorkingHours).mockResolvedValue(40);

      const response = await request(app)
        .post('/api/v1/work-hours')
        .send({ start: '2026-03-01', end: '2026-03-07' });

      expect(response.status).toBe(200);
      expect(response.body.workHours).toBe(40);
      expect(response.body.period.start).toBe('2026-03-01');
      expect(calculatorService.calculateWorkingHours).toHaveBeenCalledWith('2026-03-01', '2026-03-07', []);
    });

    it('should pass paid leave dates to calculator service', async () => {
      vi.mocked(calculatorService.calculateWorkingHours).mockResolvedValue(24);

      const response = await request(app)
        .post('/api/v1/work-hours')
        .send({ month: '2026-03', paidLeaveDates: ['2026-03-03', '2026-03-05'] });

      expect(response.status).toBe(200);
      expect(calculatorService.calculateWorkingHours).toHaveBeenCalledWith(
        '2026-03-01',
        '2026-03-31',
        ['2026-03-03', '2026-03-05']
      );
    });

    it('should return 400 when paid leave dates are invalid', async () => {
      const response = await request(app)
        .post('/api/v1/work-hours')
        .send({ month: '2026-03', paidLeaveDates: ['03-03-2026'] });

      expect(response.status).toBe(400);
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
    it('should return 400 if month and period query parameters are missing', async () => {
      const response = await request(app).get('/api/v1/holidays?start=2026-03-01');
      expect(response.status).toBe(400);
    });

    it('should return holiday list for a month query', async () => {
      vi.mocked(calculatorService.getHolidaysList).mockResolvedValue(['3/20']);

      const response = await request(app).get('/api/v1/holidays?month=2026-03');

      expect(response.status).toBe(200);
      expect(response.body.holidays).toEqual(['3/20']);
      expect(calculatorService.getHolidaysList).toHaveBeenCalledWith('2026-03-01', '2026-03-31', []);
    });

    it('should return holiday list if request is valid', async () => {
      vi.mocked(calculatorService.getHolidaysList).mockResolvedValue(['1/1', '1/2', '1/3']);

      const response = await request(app).get('/api/v1/holidays?start=2026-01-01&end=2026-01-03');

      expect(response.status).toBe(200);
      expect(response.body.holidays).toEqual(['1/1', '1/2', '1/3']);
      expect(calculatorService.getHolidaysList).toHaveBeenCalledWith('2026-01-01', '2026-01-03', []);
    });

    it('should include paid leave dates when provided in query parameters', async () => {
      vi.mocked(calculatorService.getHolidaysList).mockResolvedValue(['3/2', '3/20']);

      const response = await request(app).get('/api/v1/holidays?month=2026-03&paidLeaveDates=2026-03-02,2026-03-10');

      expect(response.status).toBe(200);
      expect(calculatorService.getHolidaysList).toHaveBeenCalledWith(
        '2026-03-01',
        '2026-03-31',
        ['2026-03-02', '2026-03-10']
      );
    });

    it('should return 400 when paid leave dates query parameter is invalid', async () => {
      const response = await request(app).get('/api/v1/holidays?month=2026-03&paidLeaveDates=2026/03/02');

      expect(response.status).toBe(400);
    });
  });
});
