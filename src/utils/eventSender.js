function eventSender(isHost, remoteBoxId, connections, event, senderId) {
        
    const boxConnection = connections.find(c => c.peer.slice(-6) == remoteBoxId);


    if (event.type == "addFile") {
        if (isHost) {
            connections.forEach(conn => {
                // Broadcast back to every connection except sender
                if (senderId !== conn.peer) {
                    conn.send(event);
                }
            });
        } else {
            // If local user is not host send event to box
            boxConnection.send(event);
        }
    } else if (event.type == "delFile") {
        if (isHost) {
            // If local user is host emit event to every user
            connections.forEach(conn => {
                // Broadcast back to every connection except sender
                if (senderId !== conn.peer) {
                    conn.send(event);
                }
            });
        } else {
            // If local user is not host send event to box
            boxConnection.send(event);
        }
    } else if (event.type == "setUsers" && isHost) {
        connections.forEach(conn => {
            conn.send(event);
        });
    } else if (event.type == "getFile") {
        connections.forEach(conn => {
            conn.send(event);
        });
    }
}

export default eventSender;