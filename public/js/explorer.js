async function main() {
    try {
        const imagesResponse = await getImages();

        const fileSystem = [{
            name: "Archives",
            isDirectory: true,
            items: [{
                name: "Images",
                isDirectory: true,
                creator: "JauumVictor",
                items: imagesResponse.map((image) => (
                    {
                        name: image.name,
                        isDirectory: false,
                        creator: "JauumVictor",
                        size: image.size,
                        download: `http://localhost:3000/image/${image.name}`
                    }
                )),
            }]
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
                name: "File Manager",
                fileSystemProvider: customProvider,
                currentPath: "Documents",
                rootFolderName: "Root",
                permissions: {
                    download: true
                },
                language: "pt-BR",
                onToolbarItemClick(e) {
                    if (e.itemData === "delete") {
                        const itemName = e.component.getSelectedItems()[0].name;

                        setTimeout(function () {
                            $("div.dx-filemanager-dialog-delete-item > div").attr("title", itemName);
                        }, 0);
                    }
                },
                contextMenu: {
                    items: ["create", {
                        name: "download"
                    }]
                },
                customizeDetailColumns: (columns) => {
                    columns.push({
                        caption: "Created",
                        dataField: "dataItem.creator"
                    });
                    return columns;
                }
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
        console.error("Link de download não disponível para o arquivo selecionado.");
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
            saveAs(content, "Download.zip");
        });
}

async function getImages() {
    const response = await fetch("http://localhost:3000/images", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })

    const data = await response.json();

    return data;
}

main();