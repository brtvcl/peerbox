let receivedChunks = {};
let chunkSize = 16384; //16 KB of chunk size


function fileCatcher(event, sharedFiles) {

    if (!Array.isArray(receivedChunks[event.payload.fileId])) {
        receivedChunks[event.payload.fileId] = [];
    };

    //Find sharedfile from array
    let sharedFile = sharedFiles.find(file => file.id == event.payload.fileId);

    // Push received chunks to cache for constructing into file later
    receivedChunks[event.payload.fileId].push(event.payload);

    // Calculate progress
    let progress = event.payload.offset + chunkSize;
    let percentage = Math.round( (progress * 100) / sharedFile.size);

    // If received enough chunks construct blob file and download
    if ( sharedFile.size / chunkSize <= receivedChunks[event.payload.fileId].length ) {
        // download finished
        // sort binary data by offset
        receivedChunks[event.payload.fileId].sort((a, b) => a.offset - b.offset);

        let binaryArray = [];
        receivedChunks[event.payload.fileId].forEach(chunk => {
            binaryArray.push(new Uint8Array(chunk.chunk));
        });

        // Construct blob file
        const constructFile = new File([...binaryArray],  sharedFile.name, { type: sharedFile.type });
        
        // Download file using a element with data uri
        const aElement = document.createElement("a");
        aElement.setAttribute("download", constructFile.name);
        const href = URL.createObjectURL(constructFile);
        aElement.href = href;
        aElement.setAttribute("target", "_blank");
        aElement.click();


        // Cleanup memory
        delete receivedChunks[event.payload.fileId];
        URL.revokeObjectURL(href);
    }

    return percentage;

}

export default fileCatcher;