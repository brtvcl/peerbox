import React from 'react'

function Modal({visible = false, title, body, cancelText, successText, onCancel, onSuccess}) {
    return (
        <div style={{backgroundColor:"rgba(0,0,0,0.4)"}} className={`absolute bottom-0 right-0 left-0 top-0 z-10 flex flex-col-reverse justify-center items-center ${visible?"":"hidden"}`}>
            <div className="rounded-xl w-10/12 max-w-lg overflow-hidden bg-white shadow-lg">
                <div className="p-2 flex justify-center items-center font-semibold">
                    {title}
                </div>
                <div className="px-2 pb-4 border-slate-300 border-b text-center">
                    {body}
                </div>
                <div className="flex">
                    {/*
                        If the cancelText is empty string dont show the cancel button)
                    */}
                    {cancelText?
                    <button onClick={onCancel} className="border-r border-slate-300 flex-1 p-2 flex justify-center items-center text-slate-500 font-bold hover:bg-slate-50">
                        {cancelText}
                    </button>:<></>
                    }
                    
                    <button onClick={onSuccess} className="flex-1 p-2 flex justify-center items-center bg-blue-500 hover:bg-blue-400 text-white font-bold">
                        {successText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Modal