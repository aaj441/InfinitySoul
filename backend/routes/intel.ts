// PR #12: Harden input validation and parseInt usage for /pacer-feed endpoint
// Validate daysBack as integer, clamp to reasonable range, and use radix 10
router.get('/pacer-feed', async (req: Request, res: Response) => {
  try {
    let daysBack = parseInt(req.query.days as string, 10);
    if (isNaN(daysBack) || daysBack < 1 || daysBack > 365) daysBack = 7;
    const filings = await fetchPACERFeed(daysBack);
    res.json({
      success: true,
      count: filings.length,
      filings
    });
  } catch (error) {
    logger.error('Error fetching PACER feed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch PACER feed'
    });
  }
});

// PR #12: Add input validation for /plaintiffs endpoint if needed (none for now)
