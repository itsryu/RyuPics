async function main() {
    try {
        const imagesResponse = await getImages();

        const fileSystem = [{
            name: "Images",
            isDirectory: true,
            creator: "JauumVictor",
            items: imagesResponse.map((image) => (
                {
                    name: image.name,
                    thumbnail: base64ToIco(image.data),
                    isDirectory: false,
                    creator: "JauumVictor",
                    size: image.size,
                    download: `https://pics.ryuzaki.cloud/image/${image.name}`
                }
            )),
        }];

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

                    popup.option({
                        title: e.file.name,
                        contentTemplate: `<img src="${e.file.dataItem.thumbnail}" class="photo-popup-image" />`,
                        toolbarItems: [{
                            locateInMenu: 'always',
                            widget: 'dxButton',
                            toolbar: 'top',
                            collision: 'fit',
                            options: {
                                text: 'Copy',

                                onClick() {
                                    const copyToClipboard = async (text) => {
                                        try {
                                            await navigator.clipboard.writeText(text);
                                            setCopied(text);
                                        } catch (err) {

                                            setCopied('');
                                        }
                                    };

                                    copyToClipboard('https://pics.ryuzaki.cloud/image/' + e.file.name);
                                    const message = `Link copied to clipboard: ${'https://pics.ryuzaki.cloud/image/' + e.file.name}`;

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

async function getImages() {
    const response = await fetch("/images", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => response.json());

    return response.data;
}

function base64toBlob(base64Data, contentType) {
    contentType = contentType || '';
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

// Função para converter base64 para ícone (.ico)
function base64ToIco(base64Data) {
    const blob = base64toBlob(base64Data, 'image/png');
    const img = new Image();

    img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        canvas.toDataURL('image/x-icon');
    };

    return URL.createObjectURL(blob);
}

main();