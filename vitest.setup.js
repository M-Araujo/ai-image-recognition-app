import * as tf from "@tensorflow/tfjs";
import * as faceapi from "face-api.js";

// ✅ Force TensorFlow.js to use CPU backend
tf.setBackend("cpu").then(() => {
    console.log("✅ TensorFlow backend successfully set to CPU.");
});

// ✅ Prevent WebGL from being registered
try {
    tf.removeBackend("webgl");
    tf.removeBackend("webgl2");
    console.log("✅ WebGL backend removed.");
} catch (error) {
    console.log("⚠️ WebGL backend was not registered, skipping removal.");
}

// ✅ Mock <canvas>.getContext to prevent WebGL requests
HTMLCanvasElement.prototype.getContext = (context) => {
    if (context === "webgl" || context === "webgl2") {
        console.log("⚠️ WebGL context request blocked.");
        return null;
    }
    return {}; // Return a generic object for other contexts
};

// ✅ Override console.error to suppress WebGL errors
const originalConsoleError = console.error;
console.error = (msg, ...args) => {
    if (typeof msg === "string" && msg.includes("WebGL is not supported")) {
        return; // Ignore WebGL errors
    }
    originalConsoleError(msg, ...args);
};

// ✅ Mock Face-api.js Model Loading to Prevent Fetch Errors in Tests
vi.mock("face-api.js", async () => {
    const actual = await vi.importActual("face-api.js");
    return {
        ...actual,
        nets: {
            tinyFaceDetector: {
                loadFromUri: vi.fn().mockResolvedValue("✅ Mocked Model Loaded"),
            },
        },
    };
});

console.log("✅ Face-api.js model loading is now mocked for tests.");
