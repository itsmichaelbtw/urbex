import urbex, { PipelineExecutor } from "./lib/urbex";

// since this package has a named export and a default export, rollup
// uses `output.exports: "named"` to make the named export the default
// this works for CJS and ESM builds, but not for UMD

// UMD exports the default export as a named and I don't want that
// by design so I have to use `output.exports: "default"`, but
// rollup complains of the 2 export types. So instead this
// file is used to combined all the exports into a single default export
// compatible for browser consumption

declare module "./lib/urbex" {
    interface ExtendedUrbexClient {
        PipelineExecutor: typeof PipelineExecutor;
    }
}

urbex.PipelineExecutor = PipelineExecutor;

export default urbex;
