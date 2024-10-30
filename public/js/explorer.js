const currentPage = 1;
const pageSize = 20;
const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
const fileExtensions = {
    video: ['webp', 'mp4', 'mov', 'webm', 'mp3', 'wav', 'ogg', 'mkv'],
    image: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']
};

const mimeTypes = {
    webp: 'video/webp',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    webm: 'video/webm',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    mkv: 'video/x-matroska'
};

async function main() {
    try {
        showLoading();
        await loadFiles(currentPage);
    } catch (error) {
        console.error("Error in main function:", error);
    } finally {
        hideLoading();
    }
}

async function loadFiles(page) {
    const filesArray = await getFiles(page, pageSize);

    console.log(filesArray);

    const images = filterFilesByType(filesArray, imageExtensions, 'image');
    const videos = filterFilesByType(filesArray, videoExtensions, 'video');

    const fileSystem = [
        { name: "Images", isDirectory: true, creator: "itsryu", items: images },
        { name: "Videos", isDirectory: true, creator: "itsryu", items: videos }
    ];

    const objectProvider = new DevExpress.fileManagement.ObjectFileSystemProvider({ data: fileSystem });
    const customProvider = new DevExpress.fileManagement.CustomFileSystemProvider({
        getItems: pathInfo => objectProvider.getItems(pathInfo),
        downloadItems: items => items.length === 1 ? downloadSingleFile(items[0]) : downloadMultipleFiles(items)
    });

    initializeFileManager(customProvider);
}

function filterFilesByType(files, extensions, typePrefix) {
    return files.filter(file => extensions.some(ext => file.name.endsWith(ext)))
        .map(file => createFileObject(file, `${typePrefix}/${file.name.split('.').pop()}`));
}

function createFileObject(file) {
    return {
        name: file.name,
        data: null,
        thumbnail: null,
        isDirectory: false,
        creator: "itsryu",
        size: file.size,
        download: `https://pics.ryuzaki.cloud/file/${file.name}`
    };
}

function initializeFileManager(customProvider) {
    $(() => {
        $("#file-manager").dxFileManager({
            name: "fileManager",
            fileSystemProvider: customProvider,
            currentPath: "Documents",
            rootFolderName: "Files",
            permissions: { download: true },
            itemView: { mode: 'thumbnails' },
            language: "en-US",
            onSelectedFileOpened: openSelectedFile,
            contextMenu: { items: ["create", { name: "download" }] },
            customizeDetailColumns: columns => [...columns, { caption: "created", dataField: "dataItem.creator" }]
        });

        $('#photo-popup').dxPopup({
            maxHeight: 600,
            hideOnOutsideClick: true,
            showCloseButton: true,
            onContentReady: e => e.component.content().addClass('photo-popup-content')
        });
    });
}

async function getFiles(page, pageSize) {
    try {
        const response = await fetch(`/files?page=${page}&pageSize=${pageSize}`, {
            method: "GET",
            headers: {   
                "Content-Type": "application/json",
                "Authorization": `Bearer ${key}`
            }
        });

        if (!response.ok) {
            console.error("Failed to fetch files:", response.statusText);
            return [];
        }

        const { data } = await response.json();
        return data || [];
    } catch (error) {
        console.error("Failed to fetch files:", error);
        return [];
    }
}

async function loadFileData(id) {
    try {
        const response = await fetch(`/file-data?id=${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${key}`
            }
        });

        if (!response.ok) {
            console.error("Failed to fetch file data:", response.statusText);
            return null;
        }

        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Failed to fetch file data:", error);
        return null;
    }
}

function showLoading() {
    const loadingPanel = $("#loading").dxLoadPanel({
        message: "Loading...",
        shadingColor: "rgba(0,0,0,0.4)",
        visible: true,
        showIndicator: true,
        showPane: true
    }).dxLoadPanel("instance");

    loadingPanel.show();
}

function hideLoading() {
    const loadingPanel = $("#loading").dxLoadPanel("instance");
    if (loadingPanel) loadingPanel.hide();
    else console.warn("Loading panel instance not found.");
}

async function openSelectedFile(e) {
    const popup = $('#photo-popup').dxPopup('instance');
    const { name, dataItem } = e.file;
    const fileExtension = name.split('.').pop();
    const fileData = await loadFileData(dataItem.dataItem.name);

    if (!fileData) {
        console.error("Failed to load file data");
        return;
    }

    const contentTemplate = isFileType(name, fileExtensions.video)
        ? `<video preload="metadata" class="photo-popup-image" controls><source src=${fileData} type="${mimeTypes[fileExtension] || 'video/mp4'}">Seu navegador não suporta o elemento de vídeo.</video>`
        : `<img id="image" src="${fileData}" class="photo-popup-image" />`;

    const file = { name, dataItem };

    popup.option({
        title: name,
        contentTemplate: contentTemplate,
        toolbarItems: [
            createToolbarButton('Copy', () => copyToClipboard(`https://pics.ryuzaki.cloud/file/${name}`)),
            createToolbarButton('Download', () => downloadSingleFile(name)),
            createToolbarButton('Delete', async () => {
                await deleteFile(file);
                popup.hide();
                await loadFiles(currentPage);
            })
        ],
        onHidden: () => popup.option("contentTemplate", null),
        onShowing: () => {
            if (isFileType(name, fileExtensions.image)) {
                const image = document.getElementById('image');
                image.onload = () => popup.repaint();
            }
        }
    });

    popup.show();
}

function createToolbarButton(text, onClick) {
    return {
        locateInMenu: 'always',
        widget: 'dxButton',
        toolbar: 'bottom',
        collision: 'fit',
        options: { text, collision: 'fit', onClick }
    };
}

async function deleteFile(file) {
    try {
        const response = await fetch(`/delete/${file.name}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${key}`
            }
        });

        if (!response.ok) throw new Error(response.statusText);

        DevExpress.ui.notify({
            message: `File deleted: ${file.name}`,
            position: { my: 'center top', at: 'center top' }
        }, 'success', 3000);
    } catch (error) {
        console.error("Failed to delete file:", error);
    }
}

async function copyToClipboard(text) {
    if (navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(text);
            notifyClipboardSuccess(text);
        } catch (error) {
            console.error("Failed to copy text to clipboard:", error);
            fallbackCopyToClipboard(text);
        }
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        notifyClipboardSuccess(text);
    } catch (error) {
        console.error("Fallback: Unable to copy", error);
    } finally {
        document.body.removeChild(textArea);
    }
}

function notifyClipboardSuccess(text) {
    DevExpress.ui.notify({
        message: `Link copied to clipboard: ${text}`,
        position: { my: 'center top', at: 'center top' }
    }, 'success', 3000);
}

async function downloadSingleFile(name) {
    try {
        const response = await fetch(`/download/${name}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${key}`,
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to download file: ${name}`);
        }

        const blob = await response.blob();
        saveAs(blob, name || 'download');
    } catch (error) {
        console.error(`Error downloading file: ${name}`, error);
        DevExpress.ui.notify(`Erro ao baixar o arquivo: ${name}`, "error", 3000);
    }
}

async function downloadMultipleFiles(files) {
    try {
        const zip = new JSZip();

        const downloadPromises = files.map(async file => {
            const name = file.dataItem?.dataItem?.name;
            const response = await fetch(`/download/${name}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${key}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to download file: ${name}`);
            }

            const blob = await response.blob();
            zip.file(name, blob);
        });

        await Promise.all(downloadPromises);

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, 'files.zip');
    } catch (error) {
        console.error("Error downloading multiple files", error);
        DevExpress.ui.notify("Erro ao baixar arquivos", "error", 3000);
    }
}

function base64toBlob(base64Data, contentType) {
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: contentType });
}

function blobToURL(base64Data, contentType) {
    try {
        return URL.createObjectURL(base64toBlob(base64Data, contentType));
    } catch (error) {
        console.error("Error converting blob to URL:", error);
        return null;
    }
}

function isFileType(fileName, types) {
    return types.some(ext => fileName.endsWith(ext));
}

$(window).scroll(async () => {
    if ($(window).scrollTop() + $(window).height() == $(document).height()) {
        currentPage++;
        showLoading();
        await loadFiles(currentPage);
        hideLoading();
    }
});

main();