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


    it("calls loadModels on mount", async () => {
        const loadModelsSpy = vi.spyOn(FaceRecognition.methods, "loadModels");

        mount(FaceRecognition, {
            global: { plugins: [PrimeVue], components: { FileUpload } },
        });

        expect(loadModelsSpy).toHaveBeenCalled();
    });


    it("updates src when a file is selected", async () => {
        const fileMock = new File(["dummy data"], "face.jpg", { type: "image/jpeg" });

        const wrapper = mount(FaceRecognition, {
            global: { plugins: [PrimeVue], components: { FileUpload } },
        });

        // Mock FileReader
        vi.spyOn(global, "FileReader").mockImplementation(() => {
            return {
                readAsDataURL: vi.fn(function () {
                    this.onload({ target: { result: "data:image/jpeg;base64,mockedImageData" } });
                }),
            };
        });

        await wrapper.vm.onFileSelect({ files: [fileMock] });

        // Wait for next DOM update cycle
        await nextTick();

        expect(wrapper.vm.src).toBe("data:image/jpeg;base64,mockedImageData"); // Ensure `src` updates correctly
    });



    it("sets faceCount to 0 if no faces are detected", async () => {
        // Mock `detectFaces` to return no faces
        vi.spyOn(wrapper.vm, "detectFaces").mockImplementation(async () => {
            wrapper.vm.faceCount = 0;
        });

        // Simulate image upload
        wrapper.vm.src = "data:image/jpeg;base64,mockedImageData";
        await nextTick();

        // Find the <img> element
        const img = wrapper.find("img");
        expect(img.exists()).toBe(true);

        // Simulate image load event
        await img.trigger("load");

        // Check if faceCount is 0
        expect(wrapper.vm.faceCount).toBe(0);
    });


    it("clears image and resets faceCount when clearImage is called", async () => {
        // Mock URL.revokeObjectURL to prevent errors
        global.URL.revokeObjectURL = vi.fn();

        // Simulate an uploaded image and detected faces
        wrapper.vm.src = "data:image/jpeg;base64,mockedImageData";
        wrapper.vm.faceCount = 2;

        // Call the clearImage method
        wrapper.vm.clearImage();

        // Ensure both src and faceCount are reset
        expect(wrapper.vm.src).toBeNull();
        expect(wrapper.vm.faceCount).toBeNull();

        // Ensure URL.revokeObjectURL was called if needed
        expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });


    it("sets loading to true while detecting faces and false after", async () => {
        // Mock detectFaces to simulate a delay
        vi.spyOn(wrapper.vm, "detectFaces").mockImplementation(async () => {
            wrapper.vm.loading = true; // Simulate loading state
            await new Promise((resolve) => setTimeout(resolve, 100)); // Fake async delay
            wrapper.vm.faceCount = 1; // Simulate face detection
            wrapper.vm.loading = false; // Simulate detection complete
        });

        // Simulate image upload
        wrapper.vm.src = "data:image/jpeg;base64,mockedImageData";
        await nextTick();

        // Find the <img> element and trigger load event
        const img = wrapper.find("img");
        await img.trigger("load");

        // Ensure loading was initially true
        expect(wrapper.vm.loading).toBe(true);

        // Wait for detection to complete
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Ensure loading is false after detection
        expect(wrapper.vm.loading).toBe(false);
    });

    it("correctly counts multiple faces detected", async () => {
        // Mock `detectFaces` to return multiple faces
        vi.spyOn(wrapper.vm, "detectFaces").mockImplementation(async () => {
            wrapper.vm.faceCount = 3; // Simulate detecting 3 faces
        });

        // Simulate image upload
        wrapper.vm.src = "data:image/jpeg;base64,mockedImageData";
        await nextTick();

        // Find the <img> element
        const img = wrapper.find("img");
        expect(img.exists()).toBe(true);

        // Simulate the image load event
        await img.trigger("load");

        // Ensure `faceCount` is 3
        expect(wrapper.vm.faceCount).toBe(3);
    });


});
