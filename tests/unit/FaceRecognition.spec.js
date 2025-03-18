import { mount } from "@vue/test-utils";
import { describe, it, expect, beforeEach, vi } from "vitest";
import PrimeVue from "primevue/config";
import FileUpload from "primevue/fileupload";
import { createApp, nextTick } from "vue";
import FaceRecognition from "../../src/components/FaceRecognition.vue";

describe("FaceRecognition.vue", () => {
    it("handles file upload correctly", async () => {
        const wrapper = mount(FaceRecognition, {
            global: {
                plugins: [PrimeVue],
                components: { FileUpload },
            },
        });

        // ✅ Mock a File
        const fileMock = new File(["image data"], "face.jpg", { type: "image/jpeg" });

        // ✅ Spy on `onFileSelect`
        const onFileSelectSpy = vi.spyOn(wrapper.vm, "onFileSelect");

        // ✅ Mock FileReader behavior
        global.FileReader = class {
            constructor() {
                this.onload = null;
            }
            readAsDataURL() {
                setTimeout(() => {
                    this.result = "data:image/jpeg;base64,mockedImageData";
                    if (this.onload) this.onload({ target: this });
                }, 10); // Simulate async behavior
            }
        };

        // ✅ Manually call `onFileSelect` instead of relying on FileUpload
        await wrapper.vm.onFileSelect({ files: [fileMock] });

        // ✅ Wait for Vue reactivity & async updates
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 20)); // Ensure async `FileReader` finishes

        // ✅ Debugging: Log the actual value of `src`
        console.log("Current src value:", wrapper.vm.src);

        // ✅ Assert `onFileSelect` was called
        expect(onFileSelectSpy).toHaveBeenCalled();

        // ✅ Assert `src` is updated correctly
        expect(wrapper.vm.src).toBe("data:image/jpeg;base64,mockedImageData");
    });
});
