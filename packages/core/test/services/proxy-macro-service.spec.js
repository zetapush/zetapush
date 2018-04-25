describe("Proxy Macro Service API", () => {
  const apiUrl = "http://api.zpush.io/";
  const sandboxId = "bcu1JtRb";

  it("Client should have a createProxyMacroService method", () => {
    expect(typeof ZetaPush.Client.prototype.createProxyMacroService).toBe(
      "function"
    );
  });
  it("WeakClient should have a createProxyMacroService method", () => {
    expect(typeof ZetaPush.WeakClient.prototype.createProxyMacroService).toBe(
      "function"
    );
  });
  it("SmartClient should have a createProxyMacroService method", () => {
    expect(typeof ZetaPush.SmartClient.prototype.createProxyMacroService).toBe(
      "function"
    );
  });
  it("createProxyMacroService method should return an object", () => {
    const client = new ZetaPush.WeakClient({
      apiUrl,
      sandboxId
    });
    const service = client.createProxyMacroService(
      ZetaPushPlatform.Macro.DEFAULT_DEPLOYMENT_ID
    );
    expect(typeof service).toBe("object");
  });
  it("createProxyMacroService returned object should support arbitrary properties as defined method", () => {
    const client = new ZetaPush.WeakClient({
      apiUrl,
      sandboxId
    });
    const service = client.createProxyMacroService(
      ZetaPushPlatform.Macro.DEFAULT_DEPLOYMENT_ID
    );
    const method = String(Math.random());
    expect(typeof service[method]).toBe("function");
  });

  it("Should correctly respond when call hello macro", done => {
    const client = new ZetaPush.WeakClient({
      apiUrl,
      sandboxId
    });
    const service = client.createProxyMacroService();
    client
      .connect()
      .then(() =>
        service.hello({
          name: "createProxyMacroService"
        })
      )
      .then(response => expect(typeof response).toBe("object"))
      .then(() => done());
  });
});
