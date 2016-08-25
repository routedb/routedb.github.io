var xml = {};
$(function() {
	main(null, 1, null);
	$("#navBrand").click(function() {
		main(null, 1, null);
	});
	$("#btnSearch").click(function() {
		main(null, 10, this);
	});
	$("#navAbout").click(function() {
		main(null, 11, this);
	});
	$("#navTermsofuse").click(function() {
		main(null, 12, this);
	});
	$("#navPrivacy").click(function() {
		main(null, 13, this);
	});
	$("#navGuideline").click(function() {
		main(null, 14, this);
	});
	$("#navContact").click(function() {
		main(null, 15, this);
	});
});

/**
 * 主処理
 *
 * @parme key キー値
 * @parme lv  階層レベル
 * @parme obj ターゲット要素
 */
var main = function(key, lv, obj) {
	$("#btnList").html(createBtn(key, lv, obj));
	initContents();
	var resultJson = "";
	if (lv > 9) {
		if (lv == 10) {
			$("#listMain").css("display", "block");
		} else if (lv == 11) {
			$("#about").css("display", "block");
		} else if (lv == 12) {
			$("#termsofuse").css("display", "block");
		} else if (lv == 13) {
			$("#privacy").css("display", "block");
		} else if (lv == 14) {
			$("#guideline").css("display", "block");
		} else if (lv == 15) {
			$("#contact").css("display", "block");
		}
	} else {
		if (lv == 1) {
			$("#listMain").css("display", "block");
			$.getJSON("prefectures.json", function(data) {
				$("#listMain").html(createList(data, key, lv));
			});
		} else if (lv == 2 || lv == 3) {
			$("#shopInfo").css("display", "none");
			$("#entryForm").css("display", "none");
			$("#listMain").css("display", "block");
			var s     = document.getElementsByTagName("head")[0].appendChild(document.createElement("script"));
			s.type    = "text/javascript";
			s.charset = "utf-8";
			if (lv == 2) {
				s.src = "https://www.ekidata.jp/api/p/" + key + ".json";
			} else if (lv == 3) {
				s.src = "https://www.ekidata.jp/api/l/" + key + ".json";
			}

			xml.onload = function(data) {
				var line      = data["line"];
				var station_l = data["station_l"];
				resultJson = '[';
				if (line != null) {
					for (x = 0; x < line.length; x++) {
						resultJson += '{"key":"' + line[x].line_cd + '","levels":"3","value":"' + line[x].line_name + '"},';
					}
				}
				if (station_l != null) {
					for (x = 0; x < station_l.length; x++) {
						resultJson += '{"key":"' + station_l[x].station_cd + '","levels":"4","value":"' + station_l[x].station_name + '"},';
					}
				}
				resultJson = resultJson.slice(0, -1);
				resultJson += ']';
				$("#listMain").html(createList($.parseJSON(resultJson), key, lv));
			}
		} else if (lv == 4) {
			$("#listMain").css("display", "block");
			$.getJSON("shop.json", function(data) {
				$("#listMain").html(createList(data, key, lv));
			});
		} else if (lv == 5) {
			$("#shopInfo").css("display", "block");
			$.getJSON("shop.json", function(data) {
				$("#shopInfo").html(createInfo(data, key, lv));
			});
			new google.maps.Geocoder().geocode({
				'address': $("#streetAddress").html()
			}, callbackRender);
		}
	}
};

/**
 * ボタン生成処理
 *
 * @parme key キー値
 * @parme lv  階層レベル
 * @parme obj ターゲット要素
 */
var createBtn = function(key, lv, obj) {
	var out       = "";
	var btnValue  = '<span style="font-weight: bold;" id="list' + key + '">HOME</span>';
	var btnStatus = "info";
	if (lv > 9) {
		out += '<div class="col-md-6"><button type="button" id="btnLv1" class="btn btn-secondary btn-info btn-block" onclick="main(null,1, this)"><span style="font-weight: bold;" id="listnull">HOME</span></button><input type="hidden" id="hidKey1" value="null"><input type="hidden" id="hidLv1" value="1"></div>';
		out += '<div class="col-md-6">';
		out += '<button type="button" id="btnLv' + lv + '" class="btn btn-secondary btn-primary btn-block" onclick="main(' + btnKey + ',' + btnLv + ', this)">' + obj.innerHTML + '</button>';
		out += '</div>';
	} else {
		var colSize   = 12 / lv;
		var btnKey    = null;
		var btnLv     = 1;
		for (var x = 1; x <= lv; x++) {
			if (x == lv) {
				if (obj != null) {
					if (obj.type == "button") {
						btnValue  = obj.innerHTML;
					} else {
						btnValue  = $("#list" + key).html();
					}
					btnKey = key;
					btnLv  = lv;
					if (lv == 5) {
						colSize = 4;
					}
				}
				btnStatus = "primary"
			} else {
				btnValue = $("#btnLv" + x).html();
				btnKey   = $("#hidKey" + x).val();
				btnLv    = $("#hidLv" + x).val();
				if (lv == 5) {
					colSize = 2	;
				}
			}
			out += '<div class="col-md-' + colSize + '">';
			out += '<button type="button" id="btnLv' + x + '" class="btn btn-secondary btn-' + btnStatus + ' btn-block" onclick="main(' + btnKey + ',' + btnLv + ', this)">' + btnValue + '</button>';
			out += '<input type="hidden" id="hidKey' + x + '" value=' + btnKey + '>';
			out += '<input type="hidden" id="hidLv' + x + '" value=' + btnLv + '>';
			out += '</div>';
		}
	}
	return out;
}

/**
 * リスト生成処理
 *
 * @parme json jsonデータ
 * @parme key キー値
 * @parme lv  階層レベル
 */
var createList = function(json, key, lv) {
	var out = "";
	for (var x in json) {
		var cnt = countData(json[x].key, lv);
		var spanBadge = "";
		if (cnt > 0) {
			spanBadge = '<span class="badge" style="background-color:#2e6da4;">' + cnt + '</span>';
		}
		if (lv == 4) {
			if (json[x].stationCode == key) {
				out += '<a href="#" class="list-group-item" onclick="main(' + json[x].key + ', ' + json[x].levels + ', this)"><span style="font-weight: bold;" id="list' + json[x].key + '">' + json[x].value + '(' + json[x].key + ')</span><span class="label label-success" style="float: right;font-size: 100%;">' + json[x].tags + '</span></a>';
			}
		} else {
			out += '<a href="#" class="list-group-item" onclick="main(' + json[x].key + ', ' + json[x].levels + ', this)"><span style="font-weight: bold;" id="list' + json[x].key + '">' + json[x].value + '(' + json[x].key + ')</span>' + spanBadge + '</a>';
		}
	}
	if (lv == 4) {
		out += '<button type="button" id="btnAdd" class="btn btn-secondary btn-danger btn-block" onclick="createEntryForm()"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button>';
	}
	return out;
}

/**
 * 店舗詳細生成処理
 *
 * @parme json jsonデータ
 * @parme key キー値
 * @parme lv  階層レベル
 */
var createInfo = function(json, key, lv) {
	var out = '<table class="table table-bordered">';
	for (var x in json) {
		if (json[x].key == key) {
			out += '<tr><th style="width:20%;">カテゴリー</th><td><a href="#" target="_blank" class="btn btn-success btn-sm active"><strong>' + json[x].tags + '</strong></a></td></tr>';
			out += '<tr><th>住所</th><td><span id="streetAddress">' + json[x].streetAddress + '</span><br><div id="map-canvas"><div/></td></tr>';
			out += '<tr><th>電話番号</th><td>' + json[x].phoneNumber + '</td></tr>';
			out += '<tr><th>営業時間</th><td>' + json[x].businessHours + '</td></tr>';
			out += '<tr><th>定休日</th><td>' + json[x].regularHoliday + '</td></tr>';
			out += '<tr><th>喫煙</th><td>' + json[x].smoking + '</td></tr>';
			out += '<tr><th>駐車場</th><td>' + json[x].parkingLot + '</td></tr>';
			out += '<tr><th>外部リンク</th><td>' + formatterLink(json[x].externalLink) + '</td></tr>';
			out += '<tr><th>備考</th><td>' + json[x].remarks + '</td></tr>';
			out += '<tr><th>更新日</th><td>' + json[x].updateDate + '</td></tr>';
		}
	}
	out += '</table>';
	return out;
}

/**
 * パッチ用カウント処理
 *
 * @parme key キー値
 * @parme lv  階層レベル
 */
var countData = function(key, lv) {
	var cnt = 0;
	$.ajaxSetup({async: false});
	$.getJSON("shop.json", function(data) {
		for (var x in data) {
			if (lv == 1) {
				if (data[x].prefecturesCode == key) {
					cnt++;
				}
			} else if (lv == 2) {
				if (data[x].lineCode == key) {
					cnt++;
				}
			} else if (lv == 3) {
				if (data[x].stationCode == key) {
					cnt++;
				}
			}
		}
	});
	return cnt
}

/**
 * 登録フォーム生成処理
 *
 * @parme key キー値
 * @parme lv  階層レベル
 */
var createEntryForm = function() {
	var key = createKey();
	$("#shopInfo").css("display", "none");
	$("#listMain").css("display", "none");
	$("#entryForm").css("display", "block");
	var out = '<div class="panel panel-default"><div class="alert alert-danger" style="display:none;" role="alert" id="errorMsg"></div>';
	out += '<form class="form-horizontal" role="form">';
	out += '<input type="hidden" class="form-control entryForm" id="prefecturesCode" value="' + $("#hidKey2").val() + '">';
	out += '<input type="hidden" class="form-control entryForm" id="lineCode" value="' + $("#hidKey3").val() + '">';
	out += '<input type="hidden" class="form-control entryForm" id="stationCode" value="' + $("#hidKey4").val() + '">';
	out += '<input type="hidden" class="form-control entryForm" id="key" value="' + key + '">';
	out += '<input type="hidden" class="form-control entryForm" id="level" value="5">';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lbltags">カテゴリー</label><div class="col-sm-10"><input class="form-control entryForm" id="tags"></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblvalue">名前</label><div class="col-sm-10"><input class="form-control entryForm" id="value"></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblstreetAddress">住所</label><div class="col-sm-10"><input class="form-control entryForm" id="streetAddress"></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblphoneNumber">電話番号</label><div class="col-sm-10"><input class="form-control entryForm" id="phoneNumber"></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblbusinessHours">営業時間</label><div class="col-sm-10"><input class="form-control entryForm" id="businessHours"></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblregularHoliday">定休日</label><div class="col-sm-10"><input class="form-control entryForm" id="regularHoliday"></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblsmoking">喫煙</label><div class="col-sm-10"><input class="form-control entryForm" id="smoking"></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblparkingLot">駐車場</label><div class="col-sm-10"><input class="form-control entryForm" id="parkingLot"></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblexternalLink">外部リンク</label><div class="col-sm-10"><textarea class="form-control entryForm" rows="3" id="externalLink"></textarea></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblremarks">備考</label><div class="col-sm-10"><textarea class="form-control entryForm" rows="3" id="remarks"></textarea></div></div>';
	out += '</form>';
	out += '<button type="button" id="btnAdd" class="btn btn-secondary btn-success btn-block" onclick="checkForm()">確認</span></button></div>';
	$("#entryForm").html(out);
}

/**
 * key値生成処理
 *
 * 店舗データからkeyの最大値を取得しインクリメントして返す
 */
var createKey = function() {
	var newKey = 0;
	$.ajaxSetup({async: false});
	$.getJSON("shop.json", function(data) {
		var arrkey = [];
		for (var x in data) {
			for (var key in data[x]) {
				if (key == "key" && data[x].key.length != 0) {
					arrkey.push(data[x].key);
				}
			}
		}
		arrkey.reverse();
		newKey = Number(arrkey[0]) + 1;
	});
	return newKey;
}

/**
 * 登録フォーム入力チェック処理
 *
 * エラーがあればエラーメッセージ出力、なければjson文字列を生成し確認画面を作成する
 */
var checkForm = function() {
	var form = $(".entryForm");
	var errMsg = "";
	var successJson = '{';
	for (var x = 0; x < form.length; x++) {
		if (!form[x].value) {
			errMsg += '<strong>' + $("#lbl" + form[x].id).html() + '</strong>が入力されていません。<br>';
		} else {
			successJson += '"' + form[x].id + '":"' + form[x].value.replace(/\r?\n/g, '<br>') + '",'
		}
	}
	var date = new Date($.now()).toLocaleString();
	successJson += '"updateDate":"' + date + '"'
	successJson += '}';
	if (!errMsg) {
		$("#errorMsg").css("display", "none");
		$("#entryForm").html(createConfirm($.parseJSON(successJson)));
	} else {
		$("#errorMsg").html(errMsg);
		$("#errorMsg").css("display", "block");
	}
}

/**
 * 確認画面生成処理
 *
 * @parme strJson 画面入力値のjson文字列
 */
var createConfirm = function(json) {
	var out  = '<table class="table table-bordered">';
	out += '<tr><th>カテゴリー</th><td>' + json.tags + '</td></tr>';
	out += '<tr><th>名前</th><td>' + json.value + '</td></tr>';
	out += '<tr><th>住所</th><td><span id="streetAddress">' + json.streetAddress + '</span><br><div id="map-canvas"><div/></td></tr>';
	out += '<tr><th>電話番号</th><td>' + json.phoneNumber + '</td></tr>';
	out += '<tr><th>営業時間</th><td>' + json.businessHours + '</td></tr>';
	out += '<tr><th>定休日</th><td>' + json.regularHoliday + '</td></tr>';
	out += '<tr><th>喫煙</th><td>' + json.smoking + '</td></tr>';
	out += '<tr><th>駐車場</th><td>' + json.parkingLot + '</td></tr>';
	out += '<tr><th>外部リンク</th><td>' + json.externalLink + '</td></tr>';
	out += '<tr><th>備考</th><td>' + json.remarks + '</td></tr>';
	out += '<tr><th>更新日</th><td>' + json.updateDate + '</td></tr>';
	out += '</table>';
	out += '<input type="hidden" id="hidJson" value="' + encodeURIComponent(JSON.stringify(json)) + '">';
	out += '<button type="button" id="btnUpdate" class="btn btn-secondary btn-success btn-block" onclick="sendEntryForm()">登録</span></button>';
	return out;
}

/**
 * 登録フォームメール送信処理
 */
var sendEntryForm = function() {
	var strJson = decodeURIComponent($("#hidJson").val());
	$.ajax({
		url: "https://formspree.io/fresnes3183@gmail.com",
		method: "POST",
		data: {
			message: strJson
		},
		dataType: "json"
	});
	var out = '<div class="panel panel-success"><div class="panel-heading"><h3 class="panel-title">路線データベースへのご登録ありがとうございました。</h3></div><div class="panel-body">ご登録いただいた店舗データについて内容を精査するため反映までに最大1週間ほどかかります。<br>1週間以上反映が無い場合、内容に不備があったものとしてお手数ですが再度ご登録お願いします。</div></div>';
	$("#entryForm").html(out);
}

/**
 * 外部リンク生成処理
 *
 * @parme externalLink 外部リンク文字列
 */
var regTabelog = new RegExp("tabelog");
var regTwitter = new RegExp("twitter");
var formatterLink = function(externalLink) {
	var out = '';
	var arrLink = externalLink.split("<br>");
	for (var x = 0; x < arrLink.length; x++) {
		if (arrLink[x].match(regTabelog)) {
			out += '<a href="' + arrLink[x] + '" target="_blank" class="btn btn-warning btn-sm active"><strong>食べログ</strong></a>';
		} else if (arrLink[x].match(regTwitter)) {
			out += '<a href="' + arrLink[x] + '" target="_blank" class="btn btn-warning btn-sm active"><strong>twitter</strong></a>';
		} else {
			out += '<a href="' + arrLink[x] + '" target="_blank" class="btn btn-warning btn-sm active"><strong>ホームページ</strong></a>';
		}
	}
	return out;
}

/**
 * ジオコーダの結果を取得したときに実行するコールバック関数。
 * この関数内で GoogleMap を出力する。
 *
 * @param results ジオコーダの結果
 * @param status ジオコーディングのステータス
 */
var callbackRender = function(results, status) {
	if (status == google.maps.GeocoderStatus.OK) {
		var options = {
			zoom: 18,
			center: results[0].geometry.location, // 指定の住所から計算した緯度経度を指定する
			mapTypeId: google.maps.MapTypeId.ROADMAP // 「地図」で GoogleMap を出力する
		};
		var gmap = new google.maps.Map(document.getElementById('map-canvas'), options);
		// #map-canvas に GoogleMap を出力する
		new google.maps.Marker({
			map: gmap,
			position: results[0].geometry.location
		});
		// 指定の住所から計算した緯度経度の位置に Marker を立てる
		adjustMapSize();
	}
}

/**
 * GoogleMap を表示する部分のサイズを調整する。
 *
 */
var adjustMapSize = function() {
	var mapCanvas = $('#map-canvas');
	mapCanvas.css("height", ($(window).height() - mapCanvas.offset().top) + "px");
}

var initContents = function() {
	var contents = $(".rowcontent");
	for (var x = 0; x < contents.length; x++) {
		$("#" + contents[x].id).css("display", "none");
	}
}