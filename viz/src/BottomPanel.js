import React, { Component } from 'react';
import { select } from 'd3-selection';
import { scaleLinear, scaleQuantize } from 'd3-scale';
import { colorScale } from './color';
import SourceView from './SourceView';

const width = 200;
const height = 500;

function drawFile({ outputFile, updateSelectedSource }) {
	const svg = select('svg#fileMap');

	if (outputFile) {
		let totalCount = 0;
		const files = Object.keys(outputFile[1])
			.map((d) => {
				return {
					name: d,
					...outputFile[1][d]
				};
			})
			.filter((d) => d.inBundleCount > 1)
			.sort((a, b) => b.inBundleCount - a.inBundleCount)
			.map((d) => {
				d.totalCount = totalCount;
				totalCount += d.count + 5;
				return d;
			});

		const chunks = svg.select('g.chunks').selectAll('rect').data(files);

		const yScale = scaleLinear().domain([ 0, totalCount ]).range([ 0, height ]);
		chunks
			.enter()
			.append('rect')
			.on('click', (d) => updateSelectedSource(d.name))
			.merge(chunks)
			.attr('width', 200)
			.attr('y', (d) => yScale(d.totalCount))
			.attr('fill', (d) => colorScale(d.inBundleCount))
			.attr('height', (d) => yScale(d.count));
	}
}

class BottomPanel extends Component {
	componentDidMount() {
		drawFile(this.props);
	}

	render() {
		const { summarySentence } = this.props;

		return (
			<div className="col-xs-12">
				{summarySentence}
				<div className="source-details">
					<svg id="fileMap" width={width} height={height}>
						<g className="chunks" />
						<g className="annotations" />
					</svg>
					<div
						className="source-container"
						style={{ display: this.props.selectedSource === null ? 'none' : 'block' }}
					>
						<SourceView
							selectedSource={this.props.selectedSource}
							perFileStats={this.props.perFileStats}
							sourceFiles={this.props.sourceFiles}
						/>
					</div>
				</div>
			</div>
		);
	}
}

export default BottomPanel;
