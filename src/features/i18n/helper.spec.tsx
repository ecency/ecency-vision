import React from "react";

import { safeHtml } from "./helper";

it("(1) safeHtml - safe tags && attrs", async () => {
  const input = `
        <h3>Foo bar baz</h3>
        <p>Lorem ipsum <a href=\"https://ecency.com\" target=\"_blank\" rel=\"noopener noreferrer\">dolor</a> sit amet, <span class=\"highlight"\>consectetur</span> adipiscing elit.</p>
        <p>Cras eu turpis et mi <strong>vestibulum</strong> viverra eget a orci.</p>
        <p><img src=\"https://ecency.com/logo.png"\ alt=\"Logo"\ /></p>
        <br>
        <ul><li><b>interdum</b></li><li>augue</li><li>ornare</li><li>ante</li></ul>
    `;

  expect(safeHtml(input)).toMatchSnapshot();
});

it("(2) safeHtml - malicious tags && attrs", async () => {
  const input = `
        <h3>Foo bar baz</h3>
        <script>document.getElementById("body").innerText='hacked!'</script>
        <img src="https://" onerror=\"javascript:alert('hacked!')\" />
        <p>foo</p>
    `;

  expect(safeHtml(input)).toMatchSnapshot();
});
