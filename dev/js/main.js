var separator = /\s+/;
var regTabelog = new RegExp("tabelog");
var regTwitter = new RegExp("twitter");
var regFacebook = new RegExp("facebook");
var regWikipedia = new RegExp("wikipedia");
var prefecturesJson, lineJson, stationJson, shopJson;
var refresh = function() {
	location.reload();
}
$(function() {
	// 非同期処理解除
	$.ajaxSetup({
		async: false
	});
	// データを取得
	$.getJSON("data/data.json", function(results) {
		// 都道府県データを取得
		prefecturesJson = results.data[0]["prefectures"];
		// 路線データを取得
		lineJson = results.data[1]["line"];
		// 駅データを取得
		stationJson = results.data[2]["station"];
		// 店舗データを取得
		shopJson = results.data[3]["shop"];
	});
	// 初期表示
	main(null, 1, null);
	// 乗換検索押下イベント
	$("#btnTransferSearch").click(function() {
		transferSearch();
	});
	// フッタータイトル押下イベント
	$("#navBrand").click(function() {
		refresh();
	});
	// 検索押下イベント
	$("#btnSearch").click(function() {
		main(null, 10, null);
	});
	// 路線データベースについて押下イベント
	$("#navAbout").click(function() {
		main(null, 11, this);
	});
	// 利用規約押下イベント
	$("#navTermsofuse").click(function() {
		main(null, 12, this);
	});
	// プライバシーポリシー押下イベント
	$("#navPrivacy").click(function() {
		main(null, 13, this);
	});
	// お問合せ押下イベント
	$("#navContact").click(function() {
		main(null, 99, this);
	});
	// フッターイベント
    $(".navbar-nav li a").click(function(event) {
    	$(".navbar-collapse").collapse('hide');
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
	console.log("main start!");
	// ボタン生成
	$("#btnList").html(createBtn(key, lv, obj));
	// コンテンツ初期化
	initContents();
	// リスト出力用json文字列
	var resultJson = "";
	if (lv > 9) {
		// 階層レベルが2桁の場合は、フッター処理
		if (lv == 10) {
			// 検索ボタン押下
			$("#listMain").css("display", "block");
			$("#listMain").html(createList(searchJson($("#keyword").val()), key, lv));
		} else if (lv == 101) {
			// 検索結果リスト押下
			$("#shopInfo").css("display", "block");
			$("#shopInfo").html(createInfo(shopJson, key, lv));
			new google.maps.Geocoder().geocode({
				'address': $("#streetAddress").text()
			}, callbackRender);
		} else if (lv == 11) {
			// 路線データベースについて押下
			$("#about").css("display", "block");
		} else if (lv == 12) {
			// 利用規約押下
			$("#termsofuse").css("display", "block");
		} else if (lv == 13) {
			// プライバシーポリシー押下
			$("#privacy").css("display", "block");
			var tagsList = [];
			for (var x in shopJson) {
				var arrtags = shopJson[x].tags.split(separator);
				for (var y in arrtags) {
					tagsList.push(arrtags[y]);
				}
			}
			var uniquetags = tagsList.filter(function (x, i, self) {
	            return self.indexOf(x) === i;
	        });
			for (var x in uniquetags) {
				console.log("#" + uniquetags[x]);
			}
		} else if (lv == 99) {
			// お問合せ押下
			$("#contactForm").css("display", "block");
		}
	} else {
		// 階層レベルが2桁の場合は、コンテンツ処理
		if (lv == 1) {
			// 都道府県リスト生成
			$("#listMain").css("display", "block");
			$("#listMain").html(createList(prefecturesJson, key, lv));
		} else if (lv == 2 || lv == 3) {
			// 路線リストまたは駅リスト生成
			$("#listMain").css("display", "block");
			// 路線または駅データ格納用オブジェクト
			var filterData = [];
			// リスト出力用json文字列を生成
			resultJson = '[';
			if (lv == 2) {
				var preData = [];
				// 駅情報から都道府県コードで取得
				preData = $.grep(stationJson, function(elem) {
					return elem.pref_cd == key;
				});
				var lineCd = [];
				for (var x in preData) {
					lineCd.push(preData[x].line_cd);
				}
				var uniqueLineCd = lineCd.filter(function(x, i, self) {
					return self.indexOf(x) == i;
				});
				var lineCdList = [];
				// 路線情報を取得
				for (var x in uniqueLineCd) {
					lineCdList = $.grep(lineJson, function(elem) {
						return elem.line_cd == uniqueLineCd[x];
					});
					filterData.push(lineCdList);
				}
				for (x = 0; x < filterData.length; x++) {
					resultJson += '{"key":"' + filterData[x][0].line_cd + '","levels":"3","value":"' + filterData[x][0].line_name + '"},';
				}
			} else if (lv == 3) {
				// 駅情報を取得
				filterData = $.grep(stationJson, function(elem) {
					return elem.line_cd == key;
				});
				for (x = 0; x < filterData.length; x++) {
					resultJson += '{"key":"' + filterData[x].station_cd + '","levels":"4","value":"' + filterData[x].station_name + '"},';
				}
			}
			resultJson = resultJson.slice(0, -1);
			resultJson += ']';
			// リスト出力
			$("#listMain").html(createList($.parseJSON(resultJson), key, lv));
		} else if (lv == 4) {
			// 店舗リスト生成
			$("#listMain").css("display", "block");
			$("#listMain").html(createList(shopJson, key, lv));
		} else if (lv == 5) {
			// 店舗詳細生成
			$("#shopInfo").css("display", "block");
			$("#shopInfo").html(createInfo(shopJson, key, lv));
			new google.maps.Geocoder().geocode({
				'address': $("#streetAddress").text()
			}, callbackRender);
		}
	}
	console.log("main end!");
	return false;
};

/**
 * ボタン生成処理
 *
 * @parme key キー値
 * @parme lv  階層レベル
 * @parme obj ターゲット要素
 * @return out ボタン用HTML文字列
 */
var createBtn = function(key, lv, obj) {
	var out       = "";
	var btnValue  = '<span style="font-weight: bold;" id="list' + key + '">HOME&nbsp;</span><span class="badge badge-info">' + shopJson.length + '</span>';
	var btnStatus = "info";
	if (lv > 9) {
		if (lv == 101) {
			out += '<div class="col-md-4"><button type="button" id="btnLv1" class="btn btn-secondary btn-info btn-block" onclick="refresh()"><span style="font-weight: bold;" id="listnull">HOME&nbsp;</span><span class="badge badge-info">' + shopJson.length + '</span></button><input type="hidden" id="hidKey1" value="null"><input type="hidden" id="hidLv1" value="1"></div>';
			out += '<div class="col-md-4">';
			out += '<button type="button" id="btnLv' + lv + '" class="btn btn-secondary btn-info btn-block" onclick="main(null, 10, null)"><strong>検索結果：「' + $("#keyword").val() + '」<strong></button>';
			out += '</div>';
			out += '<div class="col-md-4">';
			out += '<button type="button" id="btnLv' + lv + '" class="btn btn-secondary btn-primary btn-block"><strong>' +  obj.childNodes[0].innerHTML + '</strong></button>';
			out += '</div>';
		} else {
			out += '<div class="col-md-6"><button type="button" id="btnLv1" class="btn btn-secondary btn-info btn-block" onclick="refresh()"><span style="font-weight: bold;" id="listnull">HOME&nbsp;</span><span class="badge badge-info">' + shopJson.length + '</span></button><input type="hidden" id="hidKey1" value="null"><input type="hidden" id="hidLv1" value="1"></div>';
			out += '<div class="col-md-6">';
			if (lv == 10) {
				out += '<button type="button" id="btnLv' + lv + '" class="btn btn-secondary btn-primary btn-block" onclick="main(null, 10, null)"><strong>検索結果：「' + $("#keyword").val() + '」<strong></button>';
			} else {
				out += '<button type="button" id="btnLv' + lv + '" class="btn btn-secondary btn-primary btn-block" onclick="main(' + btnKey + ',' + btnLv + ', this)">' + obj.innerHTML + '</button>';
			}
			out += '</div>';
		}
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
						if ($("#badge" + key).length) {
							btnValue  +=  '&nbsp;</span><span class="badge badge-info">' + $("#badge" + key).html() + '</span>';
						}
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
			if (lv == 1) {
				out += '<button type="button" id="btnLv' + x + '" class="btn btn-secondary btn-' + btnStatus + ' btn-block" onclick="refresh()"><strong>' + btnValue + '</strong></button>';
			} else {
				out += '<button type="button" id="btnLv' + x + '" class="btn btn-secondary btn-' + btnStatus + ' btn-block" onclick="main(' + btnKey + ',' + btnLv + ', this)"><strong>' + btnValue + '</strong></button>';
			}
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
 * @return out リスト用HTML文字列
 */
var createList = function(json, key, lv) {
	var out = "";
	console.log("createList start!");
	if (lv == 4) {
		var lineCdList = createJoinLineList(key);
		for (var x in lineCdList) {
			if (lineCdList[x].length > 0) {
				var badge = "";
				var cnt = countData(lineCdList[x][0].line_cd, 2);
				if (cnt != 0) {
					badge = '&nbsp;<span class="badge badge-info">' + cnt + '</span>'
				}
				out += '<button type="button" id="btnAdd" class="btn btn-secondary btn-success btn-block" onclick="main(' + lineCdList[x][0].line_cd + ', 3, this)"><strong>' + lineCdList[x][0].line_name + badge +'</strong></button>';
			}
		}
	}
	for (var x in json) {
		//console.log(json[x]);
		var cnt = countData(json[x].key, lv);
		var spanBadge = "";
		if (cnt > 0) {
			spanBadge = '<span class="badge" style="background-color:#2e6da4;" id="badge' + json[x].key + '">' + cnt + '</span>';
		}
		if (lv == 4) {
			if (json[x].stationCode == key) {
				out += '<a href="javascript:void(0)" class="list-group-item" onclick="main(' + json[x].key + ', ' + json[x].levels + ', this)"><span style="font-weight: bold;" id="list' + json[x].key + '">' + json[x].value + '</span><span class="label label-success" style="padding:.3em .6em .2em;float: right;font-size: 85%;">' + json[x].tags + '</span></a>';
			}
		} else if (lv == 10) {
			out += '<a href="javascript:void(0)" class="list-group-item" onclick="main(' + json[x].key + ', 101, this)"><span style="font-weight: bold;" id="list' + json[x].key + '">' + json[x].value + '</span><span class="label label-success" style="padding:.3em .6em .2em;float: right;font-size: 85%;">' + json[x].tags + '</span></a>';
		} else {
			var mark = "";
			if (lv == 3 && createJoinLineList(json[x].key) != "") {
				mark = "<strong>*</strong>";
			}
			out += '<a href="javascript:void(0)" class="list-group-item" onclick="main(' + json[x].key + ', ' + json[x].levels + ', this)"><span style="font-weight: bold;" id="list' + json[x].key + '">' + json[x].value + mark + '</span>' + spanBadge + '</a>';
		}
	}
	if (lv == 4) {
		out += '<button type="button" id="btnAdd" class="btn btn-secondary btn-danger btn-block" onclick="createEntryForm()"><strong>追加</strong></button>';
	}
	console.log("createList end!")
	return out;
}

/**
 * 乗換情報一覧生成処理
 *
 * @parme stationCode 駅コード
 * @return out 乗換情報用HTML文字列
 */
var createJoinLineList = function(stationCode) {
	var groupCode = getGroupCode(stationCode);
	var joinLineList = [];
	// 駅情報から駅グループコードで乗換路線情報を取得
	joinLineList = $.grep(stationJson, function(elem) {
		return elem.station_g_cd == groupCode;
	});
	var lineCdList = [];
	// 路線情報を取得
	for (var x in joinLineList) {
		var temp = $.grep(lineJson, function(elem) {
			return (elem.line_cd == joinLineList[x].line_cd && stationCode != joinLineList[x].station_cd);
		});
		lineCdList.push(temp);
	}
	return lineCdList;
}

/**
 * グループコード取得処理
 *
 * @parme stationCode 駅コード
 * @return groupCode グループコード
 */
var getGroupCode = function(stationCode) {
	var stationData = $.grep(stationJson, function(elem) {
		return elem.station_cd == stationCode;
	});
	return stationData[0].station_g_cd;
}

/**
 * 店舗詳細生成処理
 *
 * @parme json jsonデータ
 * @parme key キー値
 * @parme lv  階層レベル
 * @return out 店舗詳細用HTML文字列
 */
var createInfo = function(json, key, lv) {
	var out = '<table class="table table-bordered">';
	for (var x in json) {
		if (json[x].key == key) {
			out += '<tr><th style="width:20%;">カテゴリー</th><td>' + formattertags(json[x].tags) + '</td></tr>';
			out += '<tr><th>住所</th><td><span id="streetAddress">' + formatterStreetAddress(json[x].streetAddress) + '<div id="map-canvas"><div/></td></tr>';
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
 * @return cnt パッチ用件数
 */
var countData = function(key, lv) {
	var cnt = 0;
	for (var x in shopJson) {
		if (lv == 1) {
			if (shopJson[x].prefecturesCode == key) {
				cnt++;
			}
		} else if (lv == 2) {
			if (shopJson[x].lineCode == key) {
				cnt++;
			}
		} else if (lv == 3) {
			if (shopJson[x].stationCode == key) {
				cnt++;
			}
		}
	}
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
	var out = '<div class="panel panel-default" style="padding:5px;"><div class="alert alert-danger" style="display:none;" role="alert" id="errorEntryMsg"></div>';
	out += '<form class="form-horizontal" role="form">';
	out += '<input type="hidden" class="form-control entryForm" id="prefecturesCode" value="' + $("#hidKey2").val() + '">';
	out += '<input type="hidden" class="form-control entryForm" id="lineCode" value="' + $("#hidKey3").val() + '">';
	out += '<input type="hidden" class="form-control entryForm" id="stationCode" value="' + $("#hidKey4").val() + '">';
	out += '<input type="hidden" class="form-control entryForm" id="key" value="' + key + '">';
	out += '<input type="hidden" class="form-control entryForm" id="levels" value="5">';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lbltags">カテゴリー</label><div class="col-sm-10"><input class="form-control entryForm" id="tags" required><span class="help-block">※必須 スペース区切りで複数入力できます。</span></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblvalue">名前</label><div class="col-sm-10"><input class="form-control entryForm" id="value" required><span class="help-block">※必須</span></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblstreetAddress">住所</label><div class="col-sm-10"><input class="form-control entryForm" id="streetAddress" required><span class="help-block">※必須</span></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblphoneNumber">電話番号</label><div class="col-sm-10"><input class="form-control entryForm" id="phoneNumber"></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblbusinessHours">営業時間</label><div class="col-sm-10"><textarea class="form-control entryForm" rows="3" id="businessHours"></textarea></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblregularHoliday">定休日</label><div class="col-sm-10"><input class="form-control entryForm" id="regularHoliday"></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblsmoking">喫煙</label><div class="col-sm-10"><input class="form-control entryForm" id="smoking"></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblparkingLot">駐車場</label><div class="col-sm-10"><input class="form-control entryForm" id="parkingLot"></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblexternalLink">外部リンク</label><div class="col-sm-10"><textarea class="form-control entryForm" rows="3" id="externalLink"></textarea></div></div>';
	out += '<div class="form-group"><label class="col-sm-2 control-label" style="text-align:center" id="lblremarks">備考</label><div class="col-sm-10"><textarea class="form-control entryForm" rows="3" id="remarks"></textarea></div></div>';
	out += '</form>';
	out += '<button type="button" id="btnAdd" class="btn btn-secondary btn-success btn-block" onclick="checkEntryForm()">確認</button></div>';
	$("#entryForm").html(out);
}

/**
 * key値生成処理
 *
 * 店舗データからkeyの最大値を取得しインクリメントして返す
 * @return newKey 生成されたkey値
 */
var createKey = function() {
	var newKey = 0;
	var arrkey = [];
	for (var x in shopJson) {
		for (var key in shopJson[x]) {
			if (key == "key" && shopJson[x].key.length != 0) {
				arrkey.push(shopJson[x].key);
			}
		}
	}
	arrkey.reverse();
	newKey = Number(arrkey[0]) + 1;
	return newKey;
}

/**
 * 登録フォーム入力チェック処理
 *
 * エラーがあればエラーメッセージ出力、なければjson文字列を生成し確認画面を作成する
 */
var checkEntryForm = function() {
	var form = $(".entryForm");
	var errMsg = "";
	var successJson = '{';
	for (var x = 0; x < form.length; x++) {
		if (!form[x].value && form[x].required) {
			errMsg += '<strong>' + $("#lbl" + form[x].id).html() + '</strong>が入力されていません。<br>';
		} else {
			successJson += '"' + form[x].id + '":"' + form[x].value.replace(/\r?\n/g, '<br>') + '",'
		}
	}
	var date = new Date($.now()).toLocaleString();
	successJson += '"updateDate":"' + date + '"'
	successJson += '}';
	if (!errMsg) {
		$("#errorEntryMsg").css("display", "none");
		$("#entryForm").html(createEntryConfirm($.parseJSON(successJson)));
	} else {
		$("#errorEntryMsg").html(errMsg);
		$("#errorEntryMsg").css("display", "block");
	}
}

/**
 * 登録フォーム確認画面生成処理
 *
 * @parme strJson 画面入力値のjson文字列
 * @return out 確認画面用HTML文字列
 */
var createEntryConfirm = function(json) {
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
	out += '<input type="hidden" id="hidEntryJson" value="' + encodeURIComponent(JSON.stringify(json)) + '">';
	out += '<button type="button" id="btnUpdate" class="btn btn-secondary btn-success btn-block" onclick="sendEntryForm()">送信</button>';
	return out;
}

/**
 * 登録フォーム送信処理
 */
var sendEntryForm = function() {
	var out = "";
	var strJson = decodeURIComponent($("#hidEntryJson").val()) + ",";
	var requestURL = 'https://hooks.slack.com/services/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';
    var request = $.ajax({
    	url: requestURL,
    	type: 'post',
    	data: 'payload=' + JSON.stringify({
    		"channel": "#routedb-entry",
    		"username": "routedb.github.io",
    		"text": strJson
    	})
    });
    request.done(function(data) {
		out = '<div class="panel panel-success"><div class="panel-heading"><h3 class="panel-title">路線データベースへのご登録ありがとうございました。</h3></div><div class="panel-body">ご登録いただいた店舗データについて内容を精査するため反映までに最大1週間ほどかかります。<br>1週間以上反映が無い場合、内容に不備があったものとしてお手数ですが再度ご登録お願いします。</div></div>';
		$("#entryForm").html(out);
		console.log("Request done.");
	});
	request.fail(function(jqXHR, textStatus) {
		out = '<div class="panel panel-success"><div class="panel-heading"><h3 class="panel-title">送信処理に失敗しました。</h3></div><div class="panel-body">お手数おかけしますがお問合せください。</div></div>';
		$("#entryForm").html(out);
		console.log("Request failed: " + textStatus);
	});
}

/**
 * 問合せフォーム入力チェック処理
 *
 * エラーがあればエラーメッセージ出力、なければjson文字列を生成し確認画面を作成する
 */
var checkContactForm = function() {
	var form = $(".contactForm");
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
	successJson += '"sendDate":"' + date + '"'
	successJson += '}';
	if (!errMsg) {
		$("#errorContactMsg").css("display", "none");
		$("#contactForm").html(createContactConfirm($.parseJSON(successJson)));
	} else {
		$("#errorContactMsg").html(errMsg);
		$("#errorContactMsg").css("display", "block");
	}
	return false;
}

/**
 * 問合せフォーム確認画面生成処理
 *
 * @parme strJson 画面入力値のjson文字列
 * @return out 確認画面用HTML文字列
 */
var createContactConfirm = function(json) {
	var out  = '<table class="table table-bordered">';
	out += '<tr><th>メールアドレス</th><td>' + json.mail + '</td></tr>';
	out += '<tr><th>問合せ内容</th><td>' + json.mailbody + '</td></tr>';
	out += '</table>';
	out += '<input type="hidden" id="hidContactJson" value="' + encodeURIComponent(JSON.stringify(json)) + '">';
	out += '<button type="button" id="btnUpdate" class="btn btn-secondary btn-success btn-block" onclick="sendContactForm()">送信</button>';
	return out;
}

/**
 * 問合せフォーム送信処理
 */
var sendContactForm = function() {
	var out = "";
	var strJson = decodeURIComponent($("#hidContactJson").val());
	var requestURL = 'https://hooks.slack.com/services/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';
    var request = $.ajax({
    	url: requestURL,
    	type: 'post',
    	data: 'payload=' + JSON.stringify({
    		"channel": "#routedb-contact",
    		"username": "routedb.github.io",
    		"text": strJson
    	})
    });
    request.done(function(data) {
		out = '<div class="panel panel-success"><div class="panel-heading"><h3 class="panel-title">路線データベースへのお問合せありがとうございました。</h3></div><div class="panel-body">お問合せいただいた内容について返信までに最大1週間ほどかかります。<br>何卒、ご了承いただきますようお願いします。</div></div>';
		$("#contactForm").html(out);
		console.log("Request done.");
	});
	request.fail(function(jqXHR, textStatus) {
		out = '<div class="panel panel-success"><div class="panel-heading"><h3 class="panel-title">送信処理に失敗しました。</h3></div><div class="panel-body">お手数おかけしますがお問合せください。</div></div>';
		$("#contactForm").html(out);
		console.log("Request failed: " + textStatus);
	});
}

/**
 * ジャンル用HTML生成処理
 *
 * @parme tags ジャンル
 * @return out ジャンル用HTML文字列
 */
var formattertags = function(tags) {
	var out = "";
	var arrtags = tags.split(separator);
  for (var x in arrtags) {
		out += '<a href="javascript:void(0)" target="_blank" class="btn btn-success btn-sm active"><strong>' + arrtags[x] + '</strong></a>';
	}
	return out;
}

/**
 * 外部リンク生成処理
 *
 * @parme externalLink 外部リンク文字列
 * @return out 外部リンク用HTML文字列
 */
var formatterLink = function(externalLink) {
	var out = "";
	var arrLink = externalLink.split("<br>");
	for (var x = 0; x < arrLink.length; x++) {
		if (arrLink[x].match(regTabelog)) {
			out += '<a href="' + arrLink[x] + '" target="_blank" class="btn btn-warning btn-sm active"><strong>食べログ</strong></a>';
		} else if (arrLink[x].match(regTwitter)) {
			out += '<a href="' + arrLink[x] + '" target="_blank" class="btn btn-warning btn-sm active"><strong>twitter</strong></a>';
		} else if (arrLink[x].match(regFacebook)) {
			out += '<a href="' + arrLink[x] + '" target="_blank" class="btn btn-warning btn-sm active"><strong>facebook</strong></a>';
		} else if (arrLink[x].match(regWikipedia)) {
			out += '<a href="' + arrLink[x] + '" target="_blank" class="btn btn-warning btn-sm active"><strong>wikipedia</strong></a>';
		} else if (externalLink.length != 0) {
			out += '<a href="' + arrLink[x] + '" target="_blank" class="btn btn-warning btn-sm active"><strong>HPまたは関連ページ</strong></a>';
		}
	}
	return out;
}

/**
 * 住所リンク生成処理
 *
 * @parme streetAddress 住所文字列
 * @return out 住所リンク用HTML文字列
 */
var formatterStreetAddress = function(streetAddress) {
	var out = streetAddress + '</span><a href ="https://maps.apple.com/?q=' + streetAddress + '" target="_blank" class="btn btn-success btn-sm active"><strong>アプリで開く</strong></a>';
	return out;
}

/**
 * 検索処理
 *
 * @parme keyword 検索文字列
 * @return resultJson 検索結果格納済jsonオブジェクト
 */
var searchJson = function(keyword) {
  var out = "";
	var resultJson = [];
	for (var row in shopJson) {
		if (andSearch(shopJson[row], keyword)) {
			resultJson.push(shopJson[row]);
			out += shopJson[row].value + " #" + shopJson[row].tags + " #" + getValue(lineJson, shopJson[row].lineCode) + " #" + getValue(stationJson, shopJson[row].stationCode) + "\r\n"
		}
	}
	console.log(out);
	return resultJson;
}

/**
 * and検索判定
 *
 * @parme target 対象オブジェクト
 * @parme keyword キーワード(半角or全角スペース区切り)
 * @return 全てのキーワードが含まれている場合はtrue、以外はfalse
 */
var andSearch = function(target, keyword) {
	// 対象オブジェクトのvalueをカンマ区切り文字列に変換
	var targetString = Object.keys(target).map(function(key) {
		return target[key]
	}).join(',');
	// キーワードを配列に格納
	var arrKeyword = keyword.split(separator);
	for (var idx in arrKeyword) {
		if (targetString.indexOf(arrKeyword[idx]) == -1) return false;
	}
	return true;
}

/**
 * 対象オブジェクトからvalue項目を取得する
 *
 * @parme target 対象オブジェクト
 * @parme key キー値
 * @return value値
 */
var getValue = function(target, key) {
	var isLine = false;
	var filterData = $.grep(target, function(elem) {
		if (target.length == 617) {
			isLine = true;
			return elem.line_cd == key;
		} else {
			return elem.station_cd == key;
		}
	});
	if (isLine) {
		return filterData[0].line_name;
	} else {
		return filterData[0].station_name;
	}
}

/**
 * 乗換検索処理
 */
var transferSearch = function() {
	initContents();
	var cnt = 0;
	var out = "";
	var errMsg = "";
	// 出発駅情報を取得
	var targetDepartStation = getStation($("#departFrom").val(), "station_name");
	// 到着駅情報を取得
	var targetArrivalStation = getStation($("#arrivalAt").val(), "station_name");
	if ($("#departFrom").val() == $("#arrivalAt").val()) {
		errMsg = "出発駅と到着駅が同じです。<br>";
	}
	if (targetDepartStation.length == 0) {
		errMsg = "出発駅が存在しません。<br>";
	}
	if (targetArrivalStation.length == 0) {
		errMsg = "到着駅が存在しません。<br>";
	}
	if (errMsg.length != 0) {
		$("#errorTransferMsg").html(errMsg);
		$("#errorTransferMsg").css("display", "block");
	} else {
		for (var x in targetDepartStation) {
			for (var y in targetArrivalStation) {
				if (targetDepartStation[x].line_cd == targetArrivalStation[y].line_cd) {
					cnt++;
					out += '<br><a href="javascript:void(0)" class="list-group-item disabled list-group-item-success"><span style="font-weight: bold;color:#3c763d;">経路(' + cnt + ')</span></a>';
					out += '<a href="javascript:void(0)" class="list-group-item disabled list-group-item-warning"><span style="font-weight: bold;color:#8a6d3b;">' + getLine(targetDepartStation[x].line_cd, "line_cd")[0].line_name + '</span></a>';
					// 出発駅と到着駅が同一路線上にある場合、路線全部の駅データを取得
					var targetLineStation = getStation(targetDepartStation[x].line_cd, "line_cd");
					// 出力フラグ
					var isHit = false;
					if (Number(targetDepartStation[x].station_cd) > Number(targetArrivalStation[y].station_cd)) {
						// 出発駅コードが到着駅コードより大きい場合、路線全部の駅データを降順に検索する。
						for (var z = targetLineStation.length - 1; z > 0; z--) {
							if (targetLineStation[z].station_cd == targetDepartStation[x].station_cd) {
								isHit = true;
							}
							var cnt = countData(targetLineStation[z].station_cd, 3);
							var spanBadge = "";
							if (cnt > 0) {
								spanBadge = '<span class="badge" style="background-color:#2e6da4;" id="badge' + targetLineStation[z].station_cd + '">' + cnt + '</span>';
							}
							var mark = "";
							if (createJoinLineList(targetLineStation[z].station_cd).length != 0) {
								mark = "<strong>*</strong>";
							}
							if (isHit) {
								out += '<a href="javascript:void(0)" class="list-group-item" onclick="main(' + targetLineStation[z].station_cd + ', 4, this)"><span style="font-weight: bold;" id="' + targetLineStation[z].station_cd + '">' + targetLineStation[z].station_name + mark + '</span>' + spanBadge + '</a>';
							}
							if (targetLineStation[z].station_cd == targetArrivalStation[y].station_cd) {
								isHit = false;
							}
						}
					} else {
						for (var z = 0; z < targetLineStation.length; z++) {
							if (targetLineStation[z].station_cd == targetDepartStation[x].station_cd) {
								isHit = true;
							}
							var cnt = countData(targetLineStation[z].station_cd, 3);
							var spanBadge = "";
							if (cnt > 0) {
								spanBadge = '<span class="badge" style="background-color:#2e6da4;" id="badge' + targetLineStation[z].station_cd + '">' + cnt + '</span>';
							}
							var mark = "";
							if (createJoinLineList(targetLineStation[z].station_cd).length != 0) {
								mark = "<strong>*</strong>";
							}
							if (isHit) {
								out += '<a href="javascript:void(0)" class="list-group-item" onclick="main(' + targetLineStation[z].station_cd + ', 4, this)"><span style="font-weight: bold;" id="' + targetLineStation[z].station_cd + '">' + targetLineStation[z].station_name + mark + '</span>' + spanBadge + '</a>';
							}
							if (targetLineStation[z].station_cd == targetArrivalStation[y].station_cd) {
								isHit = false;
							}
						}
					}
				}
			}
		}
		if (cnt == 0) {
			// 乗換が必要な場合
			for (var x in targetDepartStation) {
				// 路線全部の駅データを取得
				var targetLineStation = getStation(targetDepartStation[x].line_cd, "line_cd");
				for (var y in targetLineStation) {
					var joinStationList = createJoinLineList(targetLineStation[y].station_cd);
				}
			}
		}
	}
	$("#listMain").css("display", "block");
	$("#listMain").html(out);
};

/**
 * 駅データを取得する
 *
 * @parme key 検索キー
 * @parme targetCol 検索対象カラム
 * @return value値
 */
var getStation = function(key, targetCol) {
	var filterStationJson = $.grep(stationJson, function(elem) {
		if (targetCol == "station_name") {
			return elem.station_name == key;
		}
		if (targetCol == "line_cd") {
			return elem.line_cd == key;
		}
	});
	return filterStationJson;
}

/**
 * 路線データを取得する
 *
 * @parme key 検索キー
 * @parme targetCol 検索対象カラム
 * @return value値
 */
var getLine = function(key, targetCol) {
	var filterLineJson = $.grep(lineJson, function(elem) {
		if (targetCol == "line_cd") {
			return elem.line_cd == key;
		}
	});
	return filterLineJson;
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

/**
 * 画面コンテンツを初期化する。
 *
 */
var initContents = function() {
	var contents = $(".rowcontent");
	for (var x = 0; x < contents.length; x++) {
		$("#" + contents[x].id).css("display", "none");
	}
}
