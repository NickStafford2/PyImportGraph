from __future__ import annotations

from pathlib import Path
from typing import Any

from flask import Flask, jsonify, send_from_directory

from pyimportgraph.analysis import ProjectModel
from pyimportgraph.serialization import build_project_snapshot


def create_app(*, project_root: Path, package_names: list[str]) -> Flask:
    frontend_dist = _frontend_dist_dir(project_root)

    static_folder = str(frontend_dist) if frontend_dist is not None else None
    app = Flask(
        __name__,
        static_folder=static_folder,
        static_url_path="",
    )

    resolved_project_root = project_root.resolve()
    normalized_package_names = tuple(package_names)

    def _build_snapshot() -> dict[str, Any]:
        model = ProjectModel.build(
            package_names=list(normalized_package_names),
            project_root=resolved_project_root,
        )
        return build_project_snapshot(model)

    @app.get("/api/health")
    def health() -> Any:
        return jsonify(
            {
                "ok": True,
                "project_root": str(resolved_project_root),
                "packages": list(normalized_package_names),
            }
        )

    @app.get("/api/snapshot")
    def snapshot() -> Any:
        return jsonify(_build_snapshot())

    @app.get("/")
    def index() -> Any:
        if frontend_dist is None:
            return _missing_frontend_message()
        return send_from_directory(frontend_dist, "index.html")

    @app.get("/<path:path>")
    def spa(path: str) -> Any:
        if frontend_dist is None:
            return _missing_frontend_message()

        target = frontend_dist / path
        if target.exists() and target.is_file():
            return send_from_directory(frontend_dist, path)

        return send_from_directory(frontend_dist, "index.html")

    return app


def _frontend_dist_dir(project_root: Path) -> Path | None:
    frontend_dist = project_root.parent / "frontend" / "dist"
    if frontend_dist.exists():
        return frontend_dist
    return None


def _missing_frontend_message() -> tuple[str, int]:
    return (
        (
            "Frontend build not found. Run `cd frontend && npm install && npm run build` "
            "for production, or run the Vite dev server with `npm run dev`."
        ),
        200,
    )
