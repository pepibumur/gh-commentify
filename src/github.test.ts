import appRunner, { commentsHandler, RequestHandler } from "./github"
import { Express } from "express"

describe("app runner", () => {

  let appMock: Express
  let handlerMock: RequestHandler

  beforeEach(() => {
    const AppMock = jest.fn<Express>(() => ({
      set: jest.fn(),
      get: jest.fn(),
      listen: jest.fn()
    }))
    appMock = new AppMock()
    const HandlerMock = jest.fn<RequestHandler>()
    handlerMock = new HandlerMock()
  })

  it("should set the right port", () => {
    appRunner(3000, appMock, handlerMock)
    expect(appMock.set).toHaveBeenCalledWith("port", 3000)
  })

  it("should register the GitHub handler", () => {
    appRunner(3000, appMock, handlerMock)
    expect(appMock.get).toHaveBeenCalledWith("/repos/:owner/:repo/issues/:number/comments", expect.anything())
  })

})