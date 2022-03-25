(function($) {
	$.fn.jointer = function(connectionColor, connectionCircleColor, useMargin) {
		this.connectionColor = connectionColor || 'grey';
		this.connectionCircleColor = connectionCircleColor || 'grey';
		this.useMargin = useMargin || !1;
		this.jointerConnectionsStore = [];
		this.connectElements = ((from, toX, toY, id) => {
			if (checkIfElementExists(from)) {
				let fromX = toX > "51%" ? 79.7 : 20;
				let fromY = ($(from).position().top)+1;
				let fLineX = fromX == 20 ? fromX + 4 : fromX - 4;
				$('.svgContainer').prepend('<svg id="' + id +
					'" width="100%" height="100%" style="position: absolute; top: 0px; z-index: -1;">' +
					'<line stroke-width="0.15%" x1="' + fLineX + '%" y1="' + fromY + '" x2="' +
					toX + '"y2="' + toY + '" stroke="' + this.connectionColor + '"/>' +
					'<circle fill="' + connectionCircleColor + '"id="p' + id + '" cx="' + toX + '" cy="' + toY + '" r="0.5%"/>' + '<line stroke-width="0.23vh" x1="' +
					fLineX + '%" y1="' + fromY + '" x2="' + fromX + '%" y2="' + fromY +
					'" stroke="' + this.connectionColor + '"/>' + '</svg>');
				this.jointerConnectionsStore.push({
					from: $(from).attr('id'),
					to: 'p' + id,
					connectionId: id
				})
			} else {
				throw new Error("elements not found in DOM")
			}
		});
		this.clearConnection = ((el) => {
			if (!el) {
				throw new Error("element not defined. can´t clear connections")
			}
			if ($(el).attr('id') !== "undefined") {
				let removeConnections = [];
				$.each(this.jointerConnectionsStore, (i, e) => {
					if ($(el).attr('id') == e.from) {
						$('#' + e.connectionId).remove();
						removeConnections.push(e)
					}
				});
				for (let i = 0; i < removeConnections.length; i++) {
					for (let a = 0; a < this.jointerConnectionsStore.length; a++) {
						if (removeConnections[i].connectionId == this.jointerConnectionsStore[a]
							.connectionId) {
							this.jointerConnectionsStore.splice(a, 1)
						}
					}
				}
			}
		});
		this.clearAllConnection = () => {
			$('.svgContainer svg').remove()
		};
		return this
	};

	function checkIfElementExists(el) {
		if ($(el).length < 1) {
			return !1
		} else {
			return !0
		}
	}
}(jQuery))