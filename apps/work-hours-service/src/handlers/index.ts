import { Request, Response, Router } from 'express';
import { calculatorService } from '../services/calculator.service';

const router = Router();

/**
 * POST /api/v1/work-hours
 * 指定期間の稼働時間を計算します。
 */
router.post('/work-hours', async (req: Request, res: Response) => {
  try {
    const { start, end } = req.body;
    if (!start || !end) {
      return res.status(400).json({ error: 'start and end are required (YYYY-MM-DD)' });
    }

    const workHours = await calculatorService.calculateWorkingHours(start, end);
    res.json({
      workHours,
      period: { start, end }
    });
  } catch (error) {
    console.error('稼働時間の計算に失敗しました:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/v1/holidays
 * 指定期間内の祝日リストを取得します。
 */
router.get('/holidays', async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'start and end query parameters are required (YYYY-MM-DD)' });
    }

    const holidays = await calculatorService.getHolidaysList(start as string, end as string);
    res.json({ holidays });
  } catch (error) {
    console.error('祝日リストの取得に失敗しました:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
