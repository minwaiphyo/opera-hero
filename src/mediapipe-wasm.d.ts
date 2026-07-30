declare module "@mediapipe/tasks-vision/vision_wasm_module_internal.js" {
  type MediaPipeModule = Record<string, unknown>;
  type MediaPipeModuleFactory = (
    moduleArgument?: MediaPipeModule,
  ) => Promise<MediaPipeModule>;

  const createMediaPipeModule: MediaPipeModuleFactory;
  export default createMediaPipeModule;
}
