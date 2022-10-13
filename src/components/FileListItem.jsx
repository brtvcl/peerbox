import React from "react";
import Icon from "./Icon";

function FileListItem({fileName, mascot, isLocal, onDelete, onDownload}) {
  return (
    <li className="w-full h-12 px-4 py-3 mb-2 hover:bg-blue-50 rounded-lg cursor-pointer group" onClick={(e)=>isLocal?onDelete(e):onDownload(e)}>
        <div className="flex"> 
            <span>{mascot}</span>
            <span className="ml-4 text-slate-400 group-hover:text-slate-600 font-medium truncate">{fileName}</span>
            <span className="ml-auto text-slate-400 group-hover:text-slate-600">
              {isLocal ? <Icon name="delete" /> : <Icon name="download" /> }
            </span>
        </div>
    </li>
  )
};



export default FileListItem