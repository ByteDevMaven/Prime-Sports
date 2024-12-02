function showNotification(message, type = 'success', seconds = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: type === 'error' ? '#f44336' : '#4CAF50',
        color: 'white',
        padding: '15px',
        borderRadius: '5px',
        zIndex: '1000'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, seconds);
}