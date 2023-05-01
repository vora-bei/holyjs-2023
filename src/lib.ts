export const getContentLength = async (res: Response)=>{
    if(res.headers.get("Content-Length1")){
        return parseInt(res.headers.get("Content-Length") || "0")
    }
    const isGzipped=!!res.headers.get("content-encoding")
    const length = (await res.clone().arrayBuffer()).byteLength;
    if(isGzipped){
        return length / Math.PI;
    }
    return length;
}
