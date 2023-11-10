$(document).ready(function () {
    d3.csv('./assets/data/Master Data.csv', function (err, masterData) {
        Chart.register(ChartDataLabels);
        Chart.defaults.set('plugins.datalabels', {
            color: '#FFF'
        });

        const rupiah = (number) => {
            return new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR"
            }).format(number);
        }

        function sort_dataset(label, data) {
            arrayOfObj = label.map(function (d, i) {
                return {
                    label: d,
                    data: data[i] || 0
                };
            });

            sortedArrayOfObj = arrayOfObj.sort(function (a, b) {
                return b.data > a.data;
            });

            newLabel = [];
            newData = [];
            sortedArrayOfObj.forEach(function (d) {
                newLabel.push(d.label);
                newData.push(d.data);
            });

            return {
                label: newLabel,
                data: newData
            }
        }
        /*
           [**  DATA HEAD  **]
        */

        var dataTenureMonthBandung = 32
        var dataTenureMonthJakarta = 33
        var dataMonthlyPurchaseBandung = 83760
        var dataMonthlyPurchaseJakarta = 84362
        var dataCLTVBandung = 5695083
        var dataCLTVJakarta = 5730502

        var dataTenureMonthGabungan = (dataTenureMonthBandung + dataTenureMonthJakarta) / 2
        var dataMonthlyPurchaseGabungan = (dataMonthlyPurchaseBandung + dataMonthlyPurchaseJakarta) / 2
        var dataCLTVGabungan = (dataCLTVBandung + dataCLTVJakarta) / 2
        
        $('#tenure_month_title').text('AVG Tenure Month')
        $('#tenure_month_value').text(Math.round(dataTenureMonthGabungan))

        $('#monthly_purchase_title').text('AVG Montly Purchase')
        $('#monthly_purchase_value').text(rupiah(dataMonthlyPurchaseGabungan))

        $('#cltv_title').text('AVG CLTV')
        $('#cltv_value').text(rupiah(dataCLTVGabungan))

        function updateCity(kota) {
            if (kota == 'BANDUNG') {
                $('#tenure_month_title').text('AVG Tenure Month (Bandung)')
                $('#monthly_purchase_title').text('AVG Montly Purchase (Bandung)')
                $('#cltv_title').text('AVG CLTV (Bandung)')
                $('#segmentation_title').text('Q3 High-Churn Segments: Bandung')
                $('#product_title').text('Q3 Product Usage: Top 4 in Bandung')
                $('#device_title').text('Q3 Device Usage: Bandung')

                $('#tenure_month_value').text(dataTenureMonthBandung)
                $('#monthly_purchase_value').text(rupiah(dataMonthlyPurchaseBandung))
                $('#cltv_value').text(rupiah(dataCLTVBandung))
                updateSegmentasi(kota)
                updateDevice(kota)
                updateProduct(kota)
            } else if (kota == 'JAKARTA') {
                $('#tenure_month_title').text('AVG Tenure Month (Jakarta)')
                $('#monthly_purchase_title').text('AVG Montly Purchase (Jakarta)')
                $('#cltv_title').text('AVG CLTV (Jakarta)')
                $('#segmentation_title').text('Q3 High-Churn Segments: Jakarta')
                $('#product_title').text('Q3 Product Usage: Top 4 in Jakarta')
                $('#device_title').text('Q3 Device Usage: Jakarta')

                $('#tenure_month_value').text(dataTenureMonthJakarta)
                $('#monthly_purchase_value').text(rupiah(dataMonthlyPurchaseJakarta))
                $('#cltv_value').text(rupiah(dataCLTVJakarta))
                updateSegmentasi(kota)
                updateDevice(kota)
                updateProduct(kota)
            }
        }
        /*
           [**  MAPS  **]
        */

        d3.json('./assets/data/geojson.json', function (err, rows_geo) {
            // function unpack(rows, key) {
            //     return rows.map(function (row) { return row[key]; });
            // }
            function unpack(rows, key) {
                return rows.map(function (row) {
                    return row[key];
                });
            }

            var data = [
                {
                    type: "choroplethmapbox",
                    locations: ["JAKARTA", "BANDUNG"],
                    z: [26.3, 27.14],
                    // coloraxis: "coloraxis2",
                    geojson: rows_geo,
                    colorscale: [[0, '#FFCD4B'], [1, '#b2172c']]
                }
            ];
            // carto-darkmatter, carto-positron, open-street-map, stamen-terrain, stamen-toner, stamen-watercolor, white-bg
            var layout = {
                dragmode: "zoom",
                mapbox: { style: "carto-positron", center: { lat: -6.5187770914005085, lon: 107.20801727424646 }, zoom: 8.408614154345544 },
                margin: { r: 0, t: 0, b: 0, l: 0 }
            };

            Plotly.newPlot("map", data, layout);
            // const layout = {
            //     mapbox: {
            //         center: { lat: -6.566908377526152, lon: 107.3551661362354 },
            //         zoom: 50
            //     },
            //     geo: {
            //         scope: 'asia',
            //         showlakes: true,
            //         resolution: 20,
            //         center: { lat: -6.566908377526152, lon: 107.3551661362354 },
            //         zoom: 50
            //     },
            // };
            // const trace = {
            //     type: "choropleth",
            //     geojson: rows_geo,
            //     locations: unpack(rows, 'kota'),
            //     featureidkey: "properties.name",
            //     z: unpack(rows, 'churn').map(v => Number(v)),
            //     colorscale: "Reds",
            //     colorbar_title: "Column",
            //     colorbar: { title: "Churn rate" },
            // };

            // Plotly.newPlot("map", [trace], layout)
            document.getElementById('map').on('plotly_click', function (eventData) {
                console.log(eventData)
                if (eventData.points) {
                    var clickedData = eventData.points[0];

                    const city = clickedData.location
                    updateCity(city)
                    console.log('Changed to ' + city)
                }
            });
            document.getElementById('map').on('plotly_relayout', function (eventData) {
                console.log(eventData)
            });
        })



        /*
           [**  Customer Segmentation  **]
        */
        function updateSegmentasi(kota) {
            if (kota == 'BANDUNG') {
                window.segmentation.data.datasets[0].data = dataSegmentasiBandung
            } else if (kota == 'JAKARTA') {
                window.segmentation.data.datasets[0].data = dataSegmentasiJakarta
            }
            window.segmentation.update()
        }
        var ctx = document.getElementById('customerSegmentation');
        var dataSegmentasiJakarta = [
            1566, 1420, 1220, 825
        ]
        var dataSegmentasiBandung = [
            637, 533, 512, 330
        ]
        var dataSegmentasiGabungan = dataSegmentasiJakarta.map((v, i) => v + dataSegmentasiBandung[i])
        var data = {
            labels: [
                'Short-term Customers with High Consumption Levels',
                'Long-term Customers with High Consumption Levels',
                'Short-term Customers with Low Consumption Levels',
                'Long-term Customers with Low Consumption Levels'
            ],
            datasets: [{
                label: 'Segmentasi Customer',
                data: dataSegmentasiGabungan,
                backgroundColor: [
                    '#b2172c',
                    '#bb5956',
                    '#bc8783',
                    '#b3b3b3'
                ],
                hoverOffset: 4,
            }]
        };

        var options = {
            tooltips: {
                enabled: false
            },
            plugins: {
                datalabels: {
                    formatter: (value, ctx) => {
                        let sum = 0;
                        let dataArr = ctx.chart.data.datasets[0].data;
                        dataArr.map(data => {
                            sum += data;
                        });
                        let percentage = (value*100 / sum).toFixed(2)+"%";
                        return percentage;
                    },
                    color: '#fff',
                }
            }
        };

        window.segmentation = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options
        });

        /*
           [**  Customer Product  **]
        */
        function updateProduct(kota) {
            if (kota == 'BANDUNG') {
                window.product.data.datasets[0].data = dataProductBandung
                window.product.data.labels = productLabelBandung
            } else if (kota == 'JAKARTA') {
                window.product.data.labels = productLabelJakarta
                window.product.data.datasets[0].data = dataProductJakarta
            }
            window.product.update()
        }


        var productLabelJakarta = ['Games Product', 'Music Product', 'Education Product', 'Video Product']
        var dataProductJakarta = [
            1438, 1730, 1749, 1947
        ]

        var productLabelBandung = ['Games Product', 'Education Product', 'Music Product', 'Video Product']
        var dataProductBandung = [
            581, 673, 699, 760
        ]

        var productLabelGabungan = ['Games Product', 'Education Product', 'Music Product', 'Video Product']
        var dataProductGabungan = [
            2019, 2422, 2429, 2707
        ]

        // var sorted = sort_dataset(productLabel, dataProductGabugan)

        var ctx = document.getElementById('customerProduct');
        var data = {
            labels: productLabelGabungan,
            datasets: [{
                data: dataProductGabungan,
                backgroundColor: [
                    '#b3b3b3',
                    '#bc8783',
                    '#bb5956',
                    '#b2172c',
                ],
                borderColor: [
                    '#fff',
                    '#fff',
                    '#fff',
                    '#fff',
                ],
                borderWidth: 1,
                datalabels: {
                    align: 'start',
                    anchor: 'end'
                }
            }]
        };

        window.product = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false,
                        position: 'top',
                    },
                    title: {
                        display: false,
                    },

                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Product',
                            color: 'gray',
                            font: {
                                // family: 'Comic Sans MS',
                                size: 15,
                                // weight: 'plain',
                                // lineHeight: 1.2,
                            },
                            padding: { top: 20, left: 0, right: 0, bottom: 0 }
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Number of Users (People)',
                            color: 'gray',
                            font: {
                                // family: 'Times',
                                size: 15,
                                style: 'bold',
                                // lineHeight: 1.2
                            },
                            padding: { top: 10, left: 0, right: 0, bottom: 10 }
                        }
                    }
                }
            }
        });

        /*
           [**  Customer Device  **]
        */
        function updateDevice(kota) {
            if (kota == 'BANDUNG') {
                window.device.data.datasets[0].data = dataDeviceBandung
            } else if (kota == 'JAKARTA') {
                window.device.data.datasets[0].data = dataDeviceJakarta
            }
            window.device.update()
        }
        var dataDeviceBandung = [
            435, 702, 875
        ];

        var dataDeviceJakarta = [
            1091, 1719, 2221
        ];

        var dataDeviceGabungan = dataDeviceJakarta.map((v, i) => v + dataDeviceBandung[i])
        var ctx = document.getElementById('customerDevice');
        var data = {
            labels: ['Low End', 'Mid End', 'High End'],
            datasets: [{
                data: dataDeviceGabungan,
                backgroundColor: [
                    '#bc8783',
                    '#bb5956',
                    '#b2172c',
                ],
                borderColor: ["#fff", "#fff", "#fff"],
                borderWidth: 1,
                datalabels: {
                    align: 'start',
                    anchor: 'end'
                }
            }]
        };
        window.device = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false,
                        position: 'top',
                    },
                    title: {
                        display: false,
                    }
                },
                scales: {
                    // y: {
                    //     beginAtZero: true,
                    // },
                    // yAxes: [{
                    //     scaleLabel: {
                    //         display: true,
                    //         labelString: 'Tes'
                    //     }
                    // }]
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Device Type',
                            color: 'gray',
                            font: {
                                // family: 'Comic Sans MS',
                                size: 15,
                                // weight: 'plain',
                                // lineHeight: 1.2,
                            },
                            padding: { top: 20, left: 0, right: 0, bottom: 0 }
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Number of Users (People)',
                            color: 'gray',
                            font: {
                                // family: 'Times',
                                size: 15,
                                style: 'bold',
                                // lineHeight: 1.2
                            },
                            padding: { top: 10, left: 0, right: 0, bottom: 10 }
                        }
                    }
                }
            }
        });

    })
});
