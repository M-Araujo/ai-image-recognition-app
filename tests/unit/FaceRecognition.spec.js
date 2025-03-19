import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue"; // ✅ Correct import
import PrimeVue from "primevue/config";
import FileUpload from "primevue/fileupload";
import { createApp } from "vue";
import FaceRecognition from "../../src/components/FaceRecognition.vue";

// ✅ Mock Face-api.js (prevents real API calls)
vi.mock("face-api.js", async () => {
    const actual = await vi.importActual("face-api.js");
    return {
        ...actual,
        detectAllFaces: vi.fn().mockResolvedValue([
            { box: { x: 10, y: 20, width: 50, height: 50 } }, // Mock face detection result
        ]),
        TinyFaceDetectorOptions: vi.fn(),
        nets: {
            tinyFaceDetector: { loadFromUri: vi.fn().mockResolvedValue(true) }
        }
    };
});

describe("FaceRecognition.vue", () => {
    let wrapper;

    beforeEach(() => {
        const app = createApp();
        app.use(PrimeVue);
        app.component("FileUpload", FileUpload);

        wrapper = mount(FaceRecognition, {
            global: {
                plugins: [PrimeVue],
                components: { FileUpload },
            },
        });

        // ✅ Mock `detectFaces`
        vi.spyOn(wrapper.vm, "detectFaces").mockImplementation(async () => {
            wrapper.vm.faceCount = 1; // Simulate face detected
        });
    });

    it("calls detectFaces when an image loads", async () => {
        // ✅ Set `src` to simulate image upload
        wrapper.vm.src = "data:image/jpeg;base64,mockedImageData";

        // ✅ Wait for Vue to update the DOM
        await nextTick();

        // ✅ Find the rendered <img> element (ensures it's in the DOM)
        const img = wrapper.find("img");

        // ✅ Ensure <img> exists before triggering `load`
        expect(img.exists()).toBe(true);

        // ✅ Simulate the `load` event
        await img.trigger("load");

        // ✅ Check if `detectFaces` was called
        expect(wrapper.vm.detectFaces).toHaveBeenCalled();

        // ✅ Check if `faceCount` was updated
        expect(wrapper.vm.faceCount).toBe(1);
    });

    /* */

    it("calls loadModels on mount", async () => {
        const loadModelsSpy = vi.spyOn(FaceRecognition.methods, "loadModels");

        mount(FaceRecognition, {
            global: { plugins: [PrimeVue], components: { FileUpload } },
        });

        expect(loadModelsSpy).toHaveBeenCalled();
    });

});
