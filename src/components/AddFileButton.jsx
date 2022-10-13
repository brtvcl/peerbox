import React from "react";
import Icon from "./Icon";

function AddFileButton({fileChange}) {

    function onChangeHandler(e) {
        fileChange(e);
    }

    return (
        <li className="w-full h-12 mb-2 bg-blue-500 rounded-lg cursor-pointer group hover:bg-blue-600">
            <input multiple className="hidden" type="file" name="fileInput" id="fileInput" onChange={onChangeHandler} />
            <label htmlFor="fileInput">
                <div className="flex w-full h-full  px-4 py-3 cursor-pointer text-white justify-center">
                <span>
                    <Icon name="add" />
                </span>
                    <span className="font-bold ml-4">Add File</span>
                </div>
            </label>
        </li>
    )

};

export default AddFileButton