/* mammoth ships no types; this is the one call the file viewer makes. */
declare module "mammoth" {
  type Result = { value: string; messages: { type: string; message: string }[] }
  const mammoth: { convertToHtml(input: { arrayBuffer: ArrayBuffer }): Promise<Result> }
  export default mammoth
}
