# The shape
This is a very long term plan if I ever get to it. Definitely after json uploads. 

1. frontend

* user pastes a GitHub repo URL
* frontend creates an analysis job
* frontend polls or subscribes for job status
* when done, frontend loads the snapshot JSON and displays it

2. API backend

* accepts repo URL and analysis options
* validates and normalizes the URL
* creates a job record
* hands work off to an isolated worker
* serves status, logs, and final results

3. worker / sandbox

* clones the repo into a temporary isolated environment
* checks out a specific commit or branch
* runs your existing analysis against that checked-out code
* stores the generated snapshot
* deletes the workspace afterward

# Security model

This is the main hard part. Treat every repo as untrusted.

## Key protections:

* never run arbitrary project code unless absolutely necessary
* prefer static analysis only
* clone into an isolated container or VM
* no host filesystem access
* strict CPU, memory, time, and disk limits
* no secrets in the environment
* ideally no outbound network after clone
* allowlist only the git operations you need
* scan repo size and file counts before full analysis
* reject giant repos, binaries, and weird archive cases

# Important design decision

The current tool is well positioned because it is static-analysis oriented. Keep it that way.

Best path:

* analyze source files directly
* do not install dependencies
* do not run `poetry install`, `pip install`, tests, or project scripts
* do not import the target project into your own runtime unless necessary

# Recommended flow

* user submits repo URL
* backend creates `job_id`
* worker clones shallowly
* worker identifies candidate Python package roots
* worker runs `ProjectModel.build(...)`
* worker writes `snapshot.json`
* frontend opens results page for that job

# Nice later additions

* support branch / commit selection
* support GitHub auth for private repos
* cache results by repo URL + commit SHA
* store previous analyses for comparison
* show clone/scan/analyze phases in the UI

# Minimal architecture I would aim for

* React frontend
* Flask or FastAPI API
* job queue
* separate worker process
* Docker sandbox for analysis
* object/file storage for snapshots
