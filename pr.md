# Fix CD Workflow Security

## Summary

- Block fork PRs from triggering deployment workflow to prevent potential security issues
- Add condition to ensure only same-repo branch PRs can deploy to staging
- Remove redundant `workflow_run.conclusion` checks that were already validated by job condition

## Test plan

- [ ] Open a PR from a same-repo branch and verify deployment triggers
- [ ] Verify fork PRs do not trigger the deployment job (job should be skipped)
- [ ] Test `workflow_dispatch` still works for manual deployments
- [ ] Verify production deploys still trigger on successful CI workflow_run
