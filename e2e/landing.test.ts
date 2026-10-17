import { expect, test } from "@playwright/test";

for (const width of [320, 390, 768, 1024, 1280, 1440]) {
  test(`landing previews fit without overlap at ${width}px`, async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ height: 900, width });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: "Meet yourself. Again." })
    ).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const navigation = page.getByRole("navigation", {
      exact: true,
      name: "Main",
    });
    await expect(navigation.getByRole("link")).toHaveCount(1);
    await expect(
      navigation.getByRole("link", { exact: true, name: "See the tests" })
    ).toBeVisible();
    const previews = page.getByRole("region", {
      name: /Five trait scores\.|I am the life of the party\.|Privacy reminder|Score reminder/u,
    });
    await expect(previews).toHaveCount(width >= 1280 ? 4 : 2);
    const geometry = await previews.evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
          top: rect.top,
        };
      })
    );
    for (const rect of geometry) {
      expect(rect.left).toBeGreaterThanOrEqual(0);
      expect(rect.right).toBeLessThanOrEqual(width);
    }
    for (const [index, first] of geometry.entries()) {
      for (const second of geometry.slice(index + 1)) {
        const overlap =
          first.left < second.right &&
          first.right > second.left &&
          first.top < second.bottom &&
          first.bottom > second.top;
        expect(overlap).toBe(false);
      }
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      )
    ).toBe(false);
    expect(errors).toEqual([]);
    if (width === 390 || width === 1440) {
      await page.screenshot({
        fullPage: true,
        path: testInfo.outputPath("landing.png"),
      });
    }
  });
}

for (const { linkName, name, slug } of [
  {
    linkName: "Big Five, in brief",
    name: "Big Five short test (IPIP-50)",
    slug: "big-five-ipip-50",
  },
  {
    linkName: "The long version",
    name: "Big Five personality test (IPIP-NEO-120)",
    slug: "big-five-ipip-neo-120",
  },
  {
    linkName: "Anxiety screen (GAD-7)",
    name: "Anxiety screen (GAD-7)",
    slug: "gad-7",
  },
  {
    linkName: "Depression screen (PHQ-9)",
    name: "Depression screen (PHQ-9)",
    slug: "phq-9",
  },
]) {
  test(`visitors can browse ${slug} and return home`, async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { exact: true, name: "Main" })
      .getByRole("link", { exact: true, name: "See the tests" })
      .click();
    await expect(page).toHaveURL(/#explore$/u);
    await page.getByRole("link", { exact: true, name: linkName }).click();
    await expect(page).toHaveURL(new RegExp(`/tests/${slug}$`, "u"));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);
    await page
      .getByRole("navigation", { exact: true, name: "Main" })
      .getByRole("link", { exact: true, name: "See the tests" })
      .click();
    await expect(page).toHaveURL(/#explore$/u);
    await page
      .getByRole("banner")
      .getByRole("link", { exact: true, name: "personality-test" })
      .click();
    await expect(
      page
        .getByRole("region", { exact: true, name: "Meet yourself. Again." })
        .getByRole("link", { exact: true, name: "See the tests" })
    ).toBeVisible();
  });
}

test("a visitor receives feedback for an invalid result file", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles({
    buffer: Buffer.from("{}"),
    mimeType: "application/json",
    name: "invalid-result.json",
  });
  await expect(
    page.getByText("That file is not a saved result.")
  ).toBeVisible();
});

test("the browser tab shows the product title and the current mark", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(page).toHaveTitle(
    "Meet yourself, again - free, open psychological tests"
  );
  await expect(
    page.locator('link[rel~="icon"][href="/favicon.svg"]')
  ).toHaveCount(1);
  await expect(
    page.locator('link[rel="apple-touch-icon"][href="/apple-touch-icon.png"]')
  ).toHaveCount(1);

  const [ico, svg, touchIcon] = await Promise.all([
    request.get("/favicon.ico"),
    request.get("/favicon.svg"),
    request.get("/apple-touch-icon.png"),
  ]);
  expect([ico.status(), svg.status(), touchIcon.status()]).toStrictEqual([
    200, 200, 200,
  ]);

  // A three-entry ICO whose payloads are PNG images, not the starter asset.
  const body = await ico.body();
  expect(body.readUInt16LE(2)).toBe(1);
  expect(body.readUInt16LE(4)).toBe(3);
  for (let index = 0; index < 3; index += 1) {
    const offset = body.readUInt32LE(6 + index * 16 + 12);
    expect(body.subarray(offset, offset + 8).toString("hex")).toBe(
      "89504e470d0a1a0a"
    );
  }
  const touchIconBody = await touchIcon.body();
  expect(touchIconBody.subarray(1, 4).toString()).toBe("PNG");
});

test("the footer reaches the supporting pages", async ({ page }) => {
  const footer = page.getByRole("navigation", { name: "Footer" });
  await page.goto("/");

  await footer.getByRole("link", { name: "Privacy" }).click();
  await expect(page).toHaveURL(/\/privacy$/u);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await footer.getByRole("link", { name: "Licences" }).click();
  await expect(page).toHaveURL(/\/licenses$/u);

  await footer.getByRole("link", { name: "Methodology" }).click();
  await expect(page).toHaveURL(/\/methodology$/u);

  await footer.getByRole("link", { name: "All tests" }).click();
  await expect(page).toHaveURL(/#explore$/u);
});
