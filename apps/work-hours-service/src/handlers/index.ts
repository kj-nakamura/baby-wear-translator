import { Request, Response, Router } from 'express';
import { endOfMonth, format, parse, isMatch } from 'date-fns';
import { calculatorService } from '../services/calculator.service';

const router = Router();

const resolvePeriod = (month?: string, start?: string, end?: string) => {
  if (month) {
    const monthDate = parse(`${month}-01`, 'yyyy-MM-dd', new Date());
    if (Number.isNaN(monthDate.getTime())) {
      return null;
    }

    return {
      start: format(monthDate, 'yyyy-MM-dd'),
      end: format(endOfMonth(monthDate), 'yyyy-MM-dd'),
    };
  }

  if (start && end) {
    return { start, end };
  }

  return null;
};

const normalizePaidLeaveDates = (value: unknown): string[] | null => {
  if (value == null) {
    return [];
  }

  const rawValues = Array.isArray(value) ? value : [value];
  const dates = rawValues.flatMap((entry) => {
    if (typeof entry !== 'string') {
      return [];
    }

    return entry
      .split(',')
      .map((date) => date.trim())
      .filter(Boolean);
  });

  if (dates.some((date) => !isMatch(date, 'yyyy-MM-dd'))) {
    return null;
  }

  return [...new Set(dates)];
};

/**
 * POST /api/v1/work-hours
 * 指定期間の稼働時間を計算します。
 */
router.post('/work-hours', async (req: Request, res: Response) => {
  try {
    const period = resolvePeriod(req.body.month, req.body.start, req.body.end);
    if (!period) {
      return res.status(400).json({ error: 'month (YYYY-MM) or start and end are required (YYYY-MM-DD)' });
    }

    const paidLeaveDates = normalizePaidLeaveDates(req.body.paidLeaveDates);
    if (!paidLeaveDates) {
      return res.status(400).json({ error: 'paidLeaveDates must be an array of YYYY-MM-DD strings' });
    }

    const workHours = await calculatorService.calculateWorkingHours(period.start, period.end, paidLeaveDates);
    res.json({
      workHours,
      period
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
    const period = resolvePeriod(
      typeof req.query.month === 'string' ? req.query.month : undefined,
      typeof req.query.start === 'string' ? req.query.start : undefined,
      typeof req.query.end === 'string' ? req.query.end : undefined
    );
    if (!period) {
      return res.status(400).json({ error: 'month (YYYY-MM) or start and end query parameters are required (YYYY-MM-DD)' });
    }

    const paidLeaveDates = normalizePaidLeaveDates(req.query.paidLeaveDates);
    if (!paidLeaveDates) {
      return res.status(400).json({ error: 'paidLeaveDates must be YYYY-MM-DD strings' });
    }

    const holidays = await calculatorService.getHolidaysList(period.start, period.end, paidLeaveDates);
    res.json({ holidays });
  } catch (error) {
    console.error('祝日リストの取得に失敗しました:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
