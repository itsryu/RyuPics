async function main() {
    try {
        const filesArray = await getFiles();

        const fileSystem = [
            {
                name: "Images",
                isDirectory: true,
                creator: "JauumVictor",
                items: filesArray.filter((file) => file.name.endsWith('png')).map((file) => (
                    {
                        name: file.name,
                        thumbnail: blobToURL(file.data, 'image/png'),
                        isDirectory: false,
                        creator: "JauumVictor",
                        size: file.size,
                        download: `https://pics.ryuzaki.cloud/file/${file.name}`
                    }
                )),
            },
            {
                name: "Videos",
                isDirectory: true,
                creator: "JauumVictor",
                items: filesArray.filter((file) => file.name.endsWith('mp4')).map((file) => (
                    {
                        name: file.name,
                        data: blobToURL(file.data, 'video/mp4'),
                        isDirectory: false,
                        creator: "JauumVictor",
                        size: file.size,
                        download: `https://pics.ryuzaki.cloud/file/${file.name}`
                    }
                )),
            }
        ];

        const objectProvider = new DevExpress.fileManagement.ObjectFileSystemProvider({
            data: fileSystem
        });

        const customProvider = new DevExpress.fileManagement.CustomFileSystemProvider({
            getItems: function (pathInfo) {
                return objectProvider.getItems(pathInfo);
            },

            downloadItems: function (items) {
                if (items.length === 1) {
                    downloadSingleFile(items[0]);
                } else {
                    downloadMultipleFiles(items);
                }
            }
        });

        $(function () {
            $("#file-manager").dxFileManager({
                name: "fileManager",
                fileSystemProvider: customProvider,
                currentPath: "Documents",
                rootFolderName: "Files",
                permissions: {
                    download: true
                },
                itemView: {
                    mode: 'thumbnails',
                },
                language: "en-US",
                onSelectedFileOpened(e) {
                    const popup = $('#photo-popup').dxPopup('instance');
                    const name = e.file.name;

                    console.log(e.file);

                    popup.option({
                        title: name,
                        contentTemplate: ['webp', 'mp4', 'mov', 'webm', 'mp3', 'wav', 'ogg'].some((ext) => name.endsWith(ext)) ? `<video preload="metadata" class="photo-popup-image" controls>  <source src=${e.file.dataItem.dataItem.data} type="video/mp4"> Seu navegador não suporta o elemento de vídeo. </video>` : `<img id="image" src="${e.file.dataItem.thumbnail}" class="photo-popup-image" />`,
                        toolbarItems: [{
                            locateInMenu: 'always',
                            widget: 'dxButton',
                            toolbar: 'bottom',
                            collision: 'fit',
                            options: {
                                text: 'Copy',
                                collision: 'fit',

                                onClick() {
                                    const copyToClipboard = async (text) => {
                                        try {
                                            await navigator.clipboard.writeText(text);
                                            setCopied(text);
                                        } catch (err) {

                                            setCopied('');
                                        }
                                    };

                                    copyToClipboard('https://pics.ryuzaki.cloud/file/' + e.file.name);
                                    const message = `Link copied to clipboard: ${'https://pics.ryuzaki.cloud/file/' + e.file.name}`;

                                    DevExpress.ui.notify({
                                        message,
                                        position: {
                                            my: 'center top',
                                            at: 'center top',
                                        },
                                    }, 'success', 3000);
                                },
                            },
                        }],
                    });

                    popup.show();
                },
                contextMenu: {
                    items: ["create", {
                        name: "download"
                    }]
                },
                customizeDetailColumns: (columns) => {
                    columns.push({
                        caption: "created",
                        dataField: "dataItem.creator"
                    });

                    return columns;
                },
            });

            $('#photo-popup').dxPopup({
                maxHeight: 600,
                hideOnOutsideClick: true,
                showCloseButton: true,
                onContentReady(e) {
                    const $contentElement = e.component.content();
                    $contentElement.addClass('photo-popup-content');
                },
            });
        });
    } catch (error) {
        console.error(error);
    }
}

function downloadSingleFile(file) {
    const downloadLink = file.dataItem.dataItem.download || null;

    if (downloadLink) {
        window.open(downloadLink, '_blank');
    } else {
        console.error("Download link not avaliable.");
    }
}

function downloadMultipleFiles(files) {
    const zip = new JSZip();

    files.forEach(function (file) {
        const content = file.dataItem.dataItem.download || "";

        zip.file(file.name, content, { base64: true });
    });

    zip.generateAsync({ type: "blob" })
        .then(function (content) {
            saveAs(content, "download.zip");
        });
}

async function getFiles() {
    const response = await fetch("/files", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`
        }
    }).then((response) => response.json());

    return response.data;
}

function base64toBlob(base64Data, contentType) {
    const sliceSize = 1024;
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
}


function blobToURL(base64Data, contentType) {
    const blob = base64toBlob(base64Data, contentType);

    return URL.createObjectURL(blob);
}

main();