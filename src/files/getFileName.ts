export const getFilename = (filename: string) => {
  const newFileName = filename.split('.')
  newFileName.pop()
  return newFileName.toString()
}
