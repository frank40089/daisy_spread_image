'use strict';

module.exports.RenderingHandle = class RenderingHandle{
	constructor(elemId)
	{
		this.draw = null;
		this.groups = [];

		this.draw = SVG(elemId).size(0, 0);
		this.clear();

		this.resource = RenderingHandle.generate_resource();
	}

	static generate_resource()
	{
		let resource = {};
/*
		try{
			const fs = require("fs");
			const path = require('path');
			const filepath = path.join(__dirname, '../image/edge.svg');
			resource.edge_icon_svg = fs.readFileSync(filepath, 'utf8');
		}catch(err){
			console.error(err);
		}
*/
		return resource;
	}

	get_draw()
	{
		return this.draw;
	}

	get_other_group()
	{
		return this.groups.other_group;
	}

	get_root_group()
	{
		return this.groups.root_group;
	}

	get_background_group()
	{
		return this.groups.background_group;
	}

	get_diagram_group()
	{
		return this.groups.diagram_group;
	}

	get_editor_group()
	{
		return this.groups.editor_group;
	}

	get_focus_group()
	{
		return this.groups.focus_group;
	}

	clear()
	{
		console.debug("xxxxxxxxXXXXXX");
		this.groups = [];
		this.draw.clear();

		this.groups.root_group			= this.draw.group().addClass('dd__root-group');
		this.groups.background_group		= this.get_root_group().group().addClass('dd__background-group');
		this.groups.diagram_group		= this.get_root_group().group().addClass('dd__diagram-group');
		this.groups.other_group			= this.get_root_group().group().addClass('dd__other-group');

		this.groups.editor_group		= this.get_root_group().group().addClass('dd__editor-group');
		this.groups.focus_group			= this.get_editor_group().group().addClass('dd__focus-group');
	}
};

module.exports.Renderer = class Renderer{
	static rerendering(rendering_handle, src_diagram, focus, mouse_state, tool_kind)
	{
		rendering_handle.clear();

		const deepcopy = function(obj){
			return JSON.parse(JSON.stringify(obj))
		};
		let diagram = deepcopy(src_diagram);
		diagram.width = diagram.property.document_width;
		diagram.height = diagram.property.document_height;

		rendering_handle.clear();

		if(null !== diagram){
			Renderer.rendering_diagram_(rendering_handle, diagram, focus, mouse_state, tool_kind);
		}
	}

	static rendering_diagram_(rendering_handle, diagram, focus, mouse_state, tool_kind){
		rendering_handle.get_draw().size( diagram.property.document_width, diagram.property.document_height);

		const opt = {};
		const svgstr_diagram = Renderer.generate_svgstr_from_diagram(diagram, opt);

		rendering_handle.get_diagram_group().svg(svgstr_diagram);
		//rendering_handle.get_diagram_group().scale(0.1, 0.1);
/*
		Renderer.draw_focus_(rendering_handle, focus);

		Renderer.draw_mouse_state_(rendering_handle, mouse_state);

		Renderer.draw_tool_(rendering_handle, diagram, mouse_state, tool_kind);
*/
		// ** frame
		{
			let background_group = rendering_handle.get_background_group();
			if(null === background_group){
				console.error('');
				return;
			}

			const margin = 2;
			let rect = {
				'x': margin,
				'y': margin,
				'width': diagram.width - (margin * 2),
				'height': diagram.height - (margin * 2),
			};
			background_group.rect(rect.width, rect.height)
				.move(rect.x, rect.y)
				.attr({
				'stroke':		'#ddd',
				'fill-opacity':		'0',
				'stroke-width':		'2',
			});
		}
	}

	static groupdrawing_circle_svg_(circle_group, diagram, elem){
		console.debug(diagram.property.magickcircle_dirpath, elem.subfilepath);

		const filepath = path.join(diagram.property.magickcircle_dirpath, elem.subfilepath);
		let circleimage_svg = fs.readFileSync(filepath, 'utf8');
		let diagram_group_ = circle_group.group().addClass('dd__circle_group__AA');
		diagram_group_.svg(circleimage_svg)
				//.move((i * 1000) - 500, (i * 1000) - 500)
				.move(elem.x, elem.y)
				.scale(elem.scale, elem.scale)
				.rotate(elem.rotate_degree)
				//.scale(elem.scale * diagram.property.magickcircle_imagescale, elem.scale * diagram.property.magickcircle_imagescale)
				.attr({
					'opacity':	1.0,
				});
	}

	static generate_svgjsdraw_from_diagram(diagram, opt){
		console.debug("diag", diagram.property.document_width, diagram.property.document_height);

		let dummy_elem = document.createElementNS('http://www.w3.org/2000/svg','svg');
		let draw = SVG(dummy_elem).size(0, 0);

		let root_group = draw.group().addClass('dd__root_group');

		if(opt.hasOwnProperty('scale')){
			draw.size(diagram.property.document_width * opt.scale, diagram.property.document_height * opt.scale);
			root_group.scale(opt.scale, opt.scale);
		}else{
			draw.size(diagram.property.document_width, diagram.property.document_height);
		}

		if(opt.hasOwnProperty('background_color')){
			let backgroud_group = root_group.group().addClass('dd__background');
			backgroud_group.rect('100%','100%')
					.attr({
						'fill':		opt.background_color,
					});
		}

		let circle_group = root_group.group().addClass('dd__circle_group');

		for(let i = 0; i < diagram.diagram_elements.length; i++){
			const diagram_element = diagram.diagram_elements[i];
			console.debug(i, diagram_element);

			switch(diagram_element.kind){
				case 'circle_svg':
					Renderer.groupdrawing_circle_svg_(circle_group, diagram, diagram_element);
					break;
				default:
					console.error("bug", i, diagram_element);
					alert(diagram_element);
			}
		}

		return draw;
	}

	static generate_svgstr_from_diagram(diagram, opt){
		const draw = Renderer.generate_svgjsdraw_from_diagram(diagram, opt);
		return draw.svg();
	}
};

