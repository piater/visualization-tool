// Copyright 2011 David Galles, University of San Francisco. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without modification, are
// permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this list of
// conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice, this list
// of conditions and the following disclaimer in the documentation and/or other materials
// provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
// FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
// ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those of the
// authors and should not be interpreted as representing official policies, either expressed
// or implied, of the University of San Francisco

import Hash from './Hash.js';
import { act } from '../anim/AnimationMain';

const POINTER_ARRAY_ELEM_WIDTH = 100;
const POINTER_ARRAY_ELEM_HEIGHT = 40;
const POINTER_ARRAY_ELEM_START_X = 100;

const LINKED_ITEM_HEIGHT = 40;
const LINKED_ITEM_WIDTH = 90;

const LINKED_ITEM_Y_DELTA = 70;

const HASH_TABLE_SIZE = 7;

const DEFAULT_LOAD_FACTOR = 0.67;

const LOAD_LABEL_X = 60;
const LOAD_LABEL_Y = 20;

const INDEX_COLOR = '#0000FF';

export default class OpenHash extends Hash {
	constructor(am, w, h) {
		super(am, w, h);
		this.nextIndex = 0;
		this.POINTER_ARRAY_ELEM_Y = h - POINTER_ARRAY_ELEM_WIDTH;
		this.setup();
	}

	addControls() {
		super.addControls();
	}

	insertElement(elem) {
		this.commands = [];
		//this.cmd(act.setText, this.ExplainLabel, 'Eintrag des Schlüssels: ' + String(elem));
		const index = this.doHash(elem);

		const node = new LinkedListNode(elem, this.nextIndex++, 100, 75);
		this.cmd(
			act.createLinkedListNode,
			node.graphicID,
			elem,
			LINKED_ITEM_WIDTH,
			LINKED_ITEM_HEIGHT,
			200,
			75,
		);
		let found = false;
		if (this.hashTableValues[index] != null) {
			// Search for duplicates
			this.cmd(act.setText, this.ExplainLabel, 'Searching for duplicates of ' + elem);

			const compareIndex = this.nextIndex++;
			let tmp = this.hashTableValues[index];
			this.cmd(act.createLabel, compareIndex, '', 10, 40, 0);
			while (tmp != null && !found) {
				this.cmd(act.setHighlight, tmp.graphicID, 1);
				if (tmp.data === elem) {
					this.cmd(act.setText, compareIndex, tmp.data + '==' + elem);
					found = true;
				} else {
					this.cmd(act.setText, compareIndex, tmp.data + '!=' + elem);
				}
				this.cmd(act.step);
				this.cmd(act.setHighlight, tmp.graphicID, 0);
				tmp = tmp.next;
			}

			this.cmd(act.delete, compareIndex);
			this.nextIndex--;
		} else {
			this.cmd(act.setNull, node.graphicID, 1);
			this.cmd(act.setNull, this.hashTableVisual[index], 0);
		}

		if (found) {
			this.cmd(act.setText, this.ExplainLabel, 'Element  ' + elem + 'existiert bereits.');
			this.cmd(act.delete, node.graphicID);
			this.cmd(act.step);
		} else {
			// this.cmd(act.setText, this.ExplainLabel, 'Duplicate of  ' + elem + '  not found!');
			this.cmd(act.step);

			if (this.hashTableValues[index] != null) {
				this.cmd(act.connect, node.graphicID, this.hashTableValues[index].graphicID);
				this.cmd(
					act.disconnect,
					this.hashTableVisual[index],
					this.hashTableValues[index].graphicID,
				);
			}

			this.cmd(act.connect, this.hashTableVisual[index], node.graphicID);
			node.next = this.hashTableValues[index];
			this.hashTableValues[index] = node;
			this.repositionList(index);
		}

		this.cmd(act.setText, this.ExplainLabel, '');

		return this.commands;
	}

	repositionList(index) {
		const startX = POINTER_ARRAY_ELEM_START_X + index * POINTER_ARRAY_ELEM_WIDTH;
		let startY = this.POINTER_ARRAY_ELEM_Y - LINKED_ITEM_Y_DELTA;
		let tmp = this.hashTableValues[index];
		while (tmp != null) {
			tmp.x = startX;
			tmp.y = startY;
			this.cmd(act.move, tmp.graphicID, tmp.x, tmp.y);
			startY = startY - LINKED_ITEM_Y_DELTA;
			tmp = tmp.next;
		}
	}

	deleteElement(elem) {
		this.commands = [];
		this.cmd(act.setText, this.ExplainLabel, 'Entferne Element: ' + elem);
		const index = this.doHash(elem);
		if (this.hashTableValues[index] == null) {
			this.cmd(
				act.setText,
				this.ExplainLabel,
				'Entferne Element: ' + elem + '  Element existiert nicht',
			);
			return this.commands;
		}
		this.cmd(act.setHighlight, this.hashTableValues[index].graphicID, 1);
		this.cmd(act.step);
		this.cmd(act.setHighlight, this.hashTableValues[index].graphicID, 0);
		if (this.hashTableValues[index].data === elem) {
			if (this.hashTableValues[index].next != null) {
				this.cmd(
					act.connect,
					this.hashTableVisual[index],
					this.hashTableValues[index].next.graphicID,
				);
			} else {
				this.cmd(act.setNull, this.hashTableVisual[index], 1);
			}
			this.cmd(act.delete, this.hashTableValues[index].graphicID);
			this.hashTableValues[index] = this.hashTableValues[index].next;
			this.repositionList(index);
			return this.commands;
		}
		let tmpPrev = this.hashTableValues[index];
		let tmp = this.hashTableValues[index].next;
		let found = false;
		while (tmp != null && !found) {
			this.cmd(act.setHighlight, tmp.graphicID, 1);
			this.cmd(act.step);
			this.cmd(act.setHighlight, tmp.graphicID, 0);
			if (tmp.data === elem) {
				found = true;
				this.cmd(
					act.setText,
					this.ExplainLabel,
					'Entferne Element: ' + elem + '  Element entfernt',
				);
				if (tmp.next != null) {
					this.cmd(act.connect, tmpPrev.graphicID, tmp.next.graphicID);
				} else {
					this.cmd(act.setNull, tmpPrev.graphicID, 1);
				}
				tmpPrev.next = tmpPrev.next.next;
				this.cmd(act.delete, tmp.graphicID);
				this.repositionList(index);
			} else {
				tmpPrev = tmp;
				tmp = tmp.next;
			}
		}
		if (!found) {
			this.cmd(
				act.setText,
				this.ExplainLabel,
				'Entferne Element: ' + elem + '  Element existiert nicht',
			);
		}
		return this.commands;
	}

	findElement(elem) {
		this.commands = [];
		this.cmd(act.setText, this.ExplainLabel, 'Suche Element: ' + elem);

		const index = this.doHash(elem);
		const compareIndex = this.nextIndex++;
		let found = false;
		let tmp = this.hashTableValues[index];
		this.cmd(act.createLabel, compareIndex, '', 10, 40, 0);
		while (tmp != null && !found) {
			this.cmd(act.setHighlight, tmp.graphicID, 1);
			if (tmp.data === elem) {
				this.cmd(act.setText, compareIndex, tmp.data + '==' + elem);
				found = true;
			} else {
				this.cmd(act.setText, compareIndex, tmp.data + '!=' + elem);
			}
			this.cmd(act.step);
			this.cmd(act.setHighlight, tmp.graphicID, 0);
			tmp = tmp.next;
		}
		if (found) {
			this.cmd(act.setText, this.ExplainLabel, 'Suche Element: ' + elem + '  gefunden!');
		} else {
			this.cmd(act.setText, this.ExplainLabel, 'Suche Element: ' + elem + '  nicht gefunden!');
		}
		this.cmd(act.delete, compareIndex);
		this.nextIndex--;
		return this.commands;
	}

	changeLoadFactor(LF) {
		this.commands = [];

		this.load_factor = LF;
		this.cmd(act.setText, this.loadFactorID, `Load Factor: ${this.load_factor}`);
		this.cmd(act.step);

		return this.commands;
	}

	setup() {
		this.hashTableVisual = new Array(HASH_TABLE_SIZE);
		this.hashTableIndices = new Array(HASH_TABLE_SIZE);
		this.hashTableValues = new Array(HASH_TABLE_SIZE);

		this.indexXPos = new Array(HASH_TABLE_SIZE);
		this.indexYPos = new Array(HASH_TABLE_SIZE);

		this.ExplainLabel = this.nextIndex++;

		this.loadFactorID = this.nextIndex++;

		this.table_size = HASH_TABLE_SIZE;

		this.load_factor = DEFAULT_LOAD_FACTOR;

		this.commands = [];
		for (let i = 0; i < HASH_TABLE_SIZE; i++) {
			let nextID = this.nextIndex++;

			this.cmd(
				act.createRectangle,
				nextID,
				'',
				POINTER_ARRAY_ELEM_WIDTH,
				POINTER_ARRAY_ELEM_HEIGHT,
				POINTER_ARRAY_ELEM_START_X + i * POINTER_ARRAY_ELEM_WIDTH,
				this.POINTER_ARRAY_ELEM_Y,
			);
			this.hashTableVisual[i] = nextID;
			this.cmd(act.setNull, this.hashTableVisual[i], 1);

			nextID = this.nextIndex++;
			this.hashTableIndices[i] = nextID;
			this.indexXPos[i] = POINTER_ARRAY_ELEM_START_X + i * POINTER_ARRAY_ELEM_WIDTH;
			this.indexYPos[i] = this.POINTER_ARRAY_ELEM_Y + POINTER_ARRAY_ELEM_HEIGHT;
			this.hashTableValues[i] = null;

			this.cmd(act.createLabel, nextID, i, this.indexXPos[i], this.indexYPos[i]);
			this.cmd(act.setForegroundColor, nextID, INDEX_COLOR);
		}
		this.cmd(act.createLabel, this.loadFactorID, `Load Factor: ${this.load_factor}`, LOAD_LABEL_X, LOAD_LABEL_Y);
		this.cmd(act.createLabel, this.ExplainLabel, '', 10, 25, 0);
		this.animationManager.startNewAnimation(this.commands);
		this.animationManager.skipForward();
		this.animationManager.clearHistory();
		this.resetIndex = this.nextIndex;
	}

	resetAll() {
		let tmp;
		this.commands = super.resetAll();
		for (let i = 0; i < this.hashTableValues.length; i++) {
			tmp = this.hashTableValues[i];
			if (tmp != null) {
				while (tmp != null) {
					this.cmd(act.delete, tmp.graphicID);
					tmp = tmp.next;
				}
				this.hashTableValues[i] = null;
				this.cmd(act.setNull, this.hashTableVisual[i], 1);
			}
		}
		return this.commands;
	}

	// NEED TO OVERRIDE IN PARENT
	reset() {
		for (let i = 0; i < this.table_size; i++) {
			this.hashTableValues[i] = null;
		}
		this.nextIndex = this.resetIndex;
		super.reset();
	}

	resetCallback() {}

	/*this.nextIndex = 0;
 this.commands = [];
 this.cmd(act.createLabel, 0, "", 20, 50, 0);
 this.animationManager.startNewAnimation(this.commands);
 this.animationManager.skipForward();
 this.animationManager.clearHistory(); */

	disableUI() {
		super.disableUI();
	}

	enableUI() {
		super.enableUI();
	}
}

class LinkedListNode {
	constructor(val, id, initialX, initialY) {
		this.data = val;
		this.graphicID = id;
		this.x = initialX;
		this.y = initialY;
		this.next = null;
	}
}
