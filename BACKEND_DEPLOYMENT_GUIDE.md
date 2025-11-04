# Backend Deployment Guide - Fly.io

This guide explains how to deploy the backend API to Fly.io to apply the latest changes.

## Prerequisites

1. **Install Fly.io CLI**
   ```bash
   # macOS
   brew install flyctl
   
   # Linux
   curl -L https://fly.io/install.sh | sh
   
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **Authenticate with Fly.io**
   ```bash
   fly auth login
   ```
   This will open a browser window for you to log in to your Fly.io account.

## Deployment Steps

### Step 1: Navigate to Backend Directory
```bash
cd broadcasting-news-aggregator/news-aggregator-backend
```

### Step 2: Verify Fly.io Configuration
Check that you're connected to the correct app:
```bash
fly status
```
You should see: `App Name: broadcasting-news-aggregator`

### Step 3: Deploy the Backend
```bash
fly deploy
```

This command will:
- Build a Docker image from your code
- Push it to Fly.io's registry
- Deploy it to your app
- Restart the service with the new code

### Step 4: Monitor Deployment
Watch the deployment progress:
```bash
fly logs
```

Press `Ctrl+C` to stop watching logs.

### Step 5: Verify Deployment
Check that the app is running:
```bash
fly status
```

Test the API endpoint:
```bash
curl https://broadcasting-news-aggregator.fly.dev/healthz
```

You should see: `{"status":"ok"}`

### Step 6: Test Radio Hub Endpoint
```bash
curl https://broadcasting-news-aggregator.fly.dev/api/news/radio
```

Verify that:
- Articles have `"url"` field (not `"link"`)
- Only Idaho stations appear (KBOI, KIDO, Kiss FM Boise, Hank FM Boise, etc.)
- No Indianapolis or other non-Idaho stations

## What Gets Deployed

The latest changes include:

1. **Field Name Fix**: Backend now returns `"url"` instead of `"link"`
2. **More Fallback Images**: 8 images instead of 5 for variety
3. **Idaho-Only Stations**: 
   - Fixed Kiss FM to use Boise-specific URL
   - Replaced Indianapolis Hank FM with Boise Hank FM (107.1)

## Troubleshooting

### Issue: "Error: failed to fetch an image or build from source"
**Solution:** Check your Dockerfile and ensure all dependencies are correct.
```bash
fly deploy --verbose
```

### Issue: "Error: app not found"
**Solution:** Make sure you're in the correct directory and authenticated:
```bash
cd news-aggregator-backend
fly auth whoami
fly status
```

### Issue: Deployment succeeds but changes don't appear
**Solution:** Clear the cache by calling the refresh endpoint:
```bash
curl -X POST https://broadcasting-news-aggregator.fly.dev/api/news/refresh
```

### Issue: App crashes after deployment
**Solution:** Check the logs for errors:
```bash
fly logs
```

Common issues:
- Missing environment variables
- Python dependency conflicts
- Port configuration issues

### Issue: Need to rollback
**Solution:** Rollback to previous version:
```bash
fly releases
fly releases rollback <version-number>
```

## Useful Commands

### View App Information
```bash
fly status                    # Check app status
fly info                      # Detailed app info
fly logs                      # View logs (live)
fly logs --app broadcasting-news-aggregator  # Specific app logs
```

### Manage Deployments
```bash
fly releases                  # List all releases
fly releases rollback         # Rollback to previous version
fly deploy --strategy rolling # Deploy with zero downtime
```

### Restart App
```bash
fly apps restart broadcasting-news-aggregator
```

### SSH into Running Instance
```bash
fly ssh console
```

### Check Resource Usage
```bash
fly vm status
fly scale show
```

## Environment Variables

If you need to set environment variables:
```bash
fly secrets list                           # List current secrets
fly secrets set KEY=value                  # Set a secret
fly secrets unset KEY                      # Remove a secret
```

## Scaling

If you need to scale the app:
```bash
# Scale memory
fly scale memory 512

# Scale VM count
fly scale count 2

# View current scaling
fly scale show
```

## Post-Deployment Verification

After deployment, verify everything works:

1. **Check Health Endpoint**
   ```bash
   curl https://broadcasting-news-aggregator.fly.dev/healthz
   ```

2. **Test Radio Hub API**
   ```bash
   curl https://broadcasting-news-aggregator.fly.dev/api/news/radio | jq '.articles[0]'
   ```
   
   Verify the response includes:
   - `"url"` field (not `"link"`)
   - Idaho station names only

3. **Check Frontend**
   - Visit the Radio Hub on your website
   - Click on article cards
   - Verify links work and go to correct URLs
   - Verify only Idaho station content appears

4. **Force Cache Refresh**
   ```bash
   curl -X POST https://broadcasting-news-aggregator.fly.dev/api/news/refresh
   ```

## Support

If you encounter issues:

1. Check Fly.io status: https://status.fly.io/
2. View Fly.io docs: https://fly.io/docs/
3. Check app logs: `fly logs`
4. Contact Fly.io support: https://community.fly.io/

## Quick Reference

```bash
# Full deployment workflow
cd broadcasting-news-aggregator/news-aggregator-backend
fly auth login
fly deploy
fly logs
curl https://broadcasting-news-aggregator.fly.dev/healthz
curl -X POST https://broadcasting-news-aggregator.fly.dev/api/news/refresh
```

## Notes

- Deployment typically takes 2-5 minutes
- The app will have a brief downtime during deployment (unless using rolling strategy)
- Cache refresh happens automatically every 6 hours, but you can force it with the `/api/news/refresh` endpoint
- Changes to the backend require redeployment to take effect
- Frontend changes (Netlify) deploy automatically on git push

## Related Files

- `fly.toml` - Fly.io configuration
- `Dockerfile` - Container build instructions
- `pyproject.toml` - Python dependencies
- `app/main.py` - Main application file
- `app/radio_scraper.py` - Radio station scraper (contains station URLs)