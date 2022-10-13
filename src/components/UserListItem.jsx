import React from 'react'

function UserListItem({mascot, isAdmin = false, isLocal = false, onKick}) {
  return (
    <li onClick={onKick} className=" w-12 p-2 flex flex-col justify-center items-center text-xl hover:bg-blue-50 rounded-xl cursor-pointer">
        <div className="text-sm h-4">{isAdmin ? "👑": ""}</div>
        <div>{mascot}</div>
        <div className={`w-3 h-1 rounded-xl mt-2 ${isLocal?"bg-blue-600":""}`}></div>
    </li>
  )
}

export default UserListItem