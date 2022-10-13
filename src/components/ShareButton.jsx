import React from "react"
import Icon from "./Icon";

function ShareButton({onShare}) {
    return (
        <button onClick={onShare} className="p-3 flex w-full font-bold text-blue-500 bg-blue-50 hover:bg-blue-100 justify-center items-center rounded-xl cursor-pointer">
            <Icon name="share" />
            <span className="ml-4">Share</span>
        </button>
    )
}

export default ShareButton