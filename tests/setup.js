import { beforeAll } from "vitest";
import { createCanvas } from "canvas";
import * as tf from "@tensorflow/tfjs-core";

tf.setBackend("cpu"); // ✅ Force CPU mode to avoid WebGL issues
// Mock the HTMLCanvasElement for JSDOM
beforeAll(() => {
    global.HTMLCanvasElement.prototype.getContext = function (type) {
        if (type === "2d") {
            return createCanvas(200, 200).getContext("2d");
        }
        return null;
    };
});
