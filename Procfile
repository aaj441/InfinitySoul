# Railway Procfile
# Defines different process types for InfinitySoul

# Main API server (always running)
web: npm run start

# Scanner worker (runs autonomous website scans)
scanner: npm run worker:scanner

# Intel worker (monitors lawsuits and plaintiff activity)
intel: npm run worker:intel

# Combined worker (runs both scanner and intel in one process - for cost savings)
worker: npm run worker:all
