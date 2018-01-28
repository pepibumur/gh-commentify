// @ts-check
import * as express from "express"
import fetch, { RequestInit, Response } from "node-fetch"

export interface GitHubGetFunction {
  (path: string, request: RequestInit): Promise<Response>;
}

export interface RequestHandler {
  (req: express.Request, res: Express.Response): void;
}

const githubGet: GitHubGetFunction = (path, request) => {
  const ghUrl = "https://api.github.com"
  return fetch([ghUrl, path].join("/"), request)
}

export const commentsHandler = (githubGet: GitHubGetFunction, owner?: string, githubToken?: string) => (req: express.Request, res: express.Response) => {
  if (req.params.owner !== owner) {
    res.status(401)
    res.json({ message: "Only can get comments with owner: " + owner })
    return
  }
  const path = ["repos", req.params.owner, req.params.repo, "issues", req.params.number, "comments"].join("/")
  const request = {
    method: "GET", headers: {
      Accept: "application/vnd.github.v3.html+json",
      Authorization: "token " + githubToken,
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

const owner = process.env.ONLY_OWNER
const githubToken = process.env.GITHUB_ACCESS_TOKEN
const appRunner = (port: number, app: express.Express = express(), handler: RequestHandler = commentsHandler(githubGet, owner, githubToken)) => {
  app.set("port", port)
  app.get("/repos/:owner/:repo/issues/:number/comments", handler)
  app.listen(app.get("port"), () => {
    console.log(`Started server at http://localhost:${process.env.PORT || 5000}`)
  })
}
export default appRunner

