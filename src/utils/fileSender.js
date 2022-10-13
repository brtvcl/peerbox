let chunkSize = 16384; //16 KB of chunk size

function fileSender(localFile, offset, conn) {
    
    let reader = new window.FileReader();
    
    reader.onload = (function() {
        return function(e) {
            
            let chunk = Array.from(new Uint8Array(e.target.result));

            // Create chunk event object
            const chunkEvent = {
                type: "chunk",
                payload: {
                    fileId: localFile.id,
                    offset: offset,
                    chunk: chunk
                }
            }

            // Send chunk
            conn.send(chunkEvent);
            
            // Calculate progress of sending
            let progress = offset + e.target.result.byteLength;
            let percentage = Math.round( (progress * 100) / localFile.file.size);

            // Send next chunk until finished
            if (localFile.file.size > offset + e.target.result.byteLength) {
                fileSender(localFile, offset + chunkSize, conn);
            }
        };
    })(localFile.file);
    // calculate file slice to read.
    var slice = localFile.file.slice(offset, offset + chunkSize);

    // read file chunk. Triggers reader.onload event with the actual file data.
    reader.readAsArrayBuffer(slice);
};

export default fileSender;