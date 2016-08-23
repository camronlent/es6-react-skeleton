import React from "react";
import { render } from "react-dom";

function HelloWorld(props) {
    return <span>Hello, world!</span>;
}

let output = document.getElementById("output");

render(<HelloWorld />, output);

