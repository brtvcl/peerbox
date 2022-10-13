// Events that client emits
let client_emits = ["addFile", "delFile", "downloadFile", "getUsers", "chunk"];

// Events that client listens for
let client_listens = ["setFiles", "setUsers", "setMascot", "getFile", "chunk"];

// Events that only host emits
let host_emits = ["setFiles", "setUsers", "setMascot"];

// Events that host listens
let host_listens = ["addFile", "delFile", "downloadFile"];



const addFileEvent = {

    type: "addFile",
    payload: {
        id,
        owner,
        name,
        size,
        type,
    }
}


const delFileEvent = {
    type: "delFile",
    payload: id
}

const setUsersEvent = {
    type: "setUsers",
    payload: [
        {id:"SAFG9S",mascot:"🐵"}
    ]
}

const getFileEvent = {
    type: "getFile",
    payload: foundFile.id
};

const chunkEvent = {
    type: "chunk",
    payload: {
        fileId: "",
        offset: "",
        chunk: ""
    }
}