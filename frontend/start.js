const { spawn } = require('child_process');
const net = require('net');

const isPortAvailable = (port) => {
    return new Promise((resolve) => {
        const server = net.createServer();
        
        server.once('error', () => {
            resolve(false);
        });
        
        server.once('listening', () => {
            server.close();
            resolve(true);
        });
        
        server.listen(port);
    });
};

const findAvailablePort = async (startPort, maxAttempts = 10) => {
    for (let port = startPort; port < startPort + maxAttempts; port++) {
        if (await isPortAvailable(port)) {
            return port;
        }
    }
    throw new Error(`No available ports found between ${startPort} and ${startPort + maxAttempts - 1}`);
};

const startFrontend = async () => {
    try {
        const port = await findAvailablePort(3000);
        console.log(`Starting frontend on port ${port}`);
        
        const startCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
        const child = spawn(startCommand, ['start'], {
            stdio: 'inherit',
            env: {
                ...process.env,
                PORT: port
            }
        });

        child.on('error', (error) => {
            console.error('Failed to start frontend:', error);
            process.exit(1);
        });

        child.on('exit', (code) => {
            console.log(`Frontend process exited with code ${code}`);
            process.exit(code);
        });
    } catch (error) {
        console.error('Failed to start frontend:', error);
        process.exit(1);
    }
};

startFrontend(); 