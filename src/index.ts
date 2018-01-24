// @ts-check
import * as express from "express"
import fetch, { RequestInit, Response } from "node-fetch"

interface GitHubGetFunction {
  (path: string, request: RequestInit): Promise<Response>;
}

interface RequestHandler {
  (req: express.Request, res: Express.Response): void;
}

const githubGet: GitHubGetFunction = (path, request) => {
  const ghUrl = "https://api.github.com"
  return fetch([ghUrl, path].join("/"), request)
}

export const commentsHandler = (githubGet: GitHubGetFunction) => (req: express.Request, res: express.Response) => {
  if (req.params.owner !== process.env.ONLY_OWNER) {
    return res.status(401).json({ message: "Only can get comments with owner: " + process.env.ONLY_OWNER })
  }
  const path = ["repos", req.params.owner, req.params.repo, "issues", req.params.number, "comments"].join("/")
  const request = {
    method: "GET", headers: {
      Accept: "application/vnd.github.v3.html+json",
      Authorization: "token " + process.env.GITHUB_ACCESS_TOKEN,
    }
  }
  githubGet(path, request).then(response => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE")
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization")
    res.status(response.status)
    const json = response.json()
    res.json(json)
  })
}

export const appRunner = (app: express.Express = express(), handler: RequestHandler = commentsHandler(githubGet)) => {
  app.set("port", process.env.PORT || 5000)
  app.get("/repos/:owner/:repo/issues/:number/comments", handler)
  app.listen(app.get("port"), () => {
    console.log(`Started server at http://localhost:${process.env.PORT || 5000}`)
  })
}
appRunner()

